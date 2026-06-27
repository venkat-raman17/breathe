import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessibilityInfo, ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { BreathOrb } from '@/components/breath-orb';
import { EnergyOverlay } from '@/components/energy-overlay';
import { AppText } from '@/components/ui/text';
import { createSession, endSession, getEnergyScript, logSessionEvent, type EnergyEventInfo } from '@/db/repo';
import { useSettings } from '@/providers/SettingsProvider';
import { useBreathEngine } from '@/session/engine';
import { resolveProgram, type ProgramPhase, type SessionProgram } from '@/session/program';
import { useAppTheme } from '@/theme/ThemeProvider';

/** Map a phase type to its caption key under chrome `session.*`. */
function captionKey(type: ProgramPhase['type']): string {
  switch (type) {
    case 'inhale':
      return 'inhale';
    case 'exhale':
      return 'exhale';
    case 'hold_in':
      return 'hold';
    case 'hold_out':
    case 'rest':
      return 'rest';
    default:
      return 'free';
  }
}

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function SessionPlayerScreen() {
  const { templateId } = useLocalSearchParams<{ templateId: string }>();
  const { colors } = useAppTheme();
  const [program, setProgram] = useState<SessionProgram | null>(null);

  useEffect(() => {
    let active = true;
    resolveProgram(templateId ?? 'demo').then((p) => {
      if (active) setProgram(p);
    });
    return () => {
      active = false;
    };
  }, [templateId]);

  if (!program) {
    return (
      <View style={[styles.root, styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return <ActiveSession program={program} />;
}

function ActiveSession({ program }: { program: SessionProgram }) {
  useKeepAwake();
  const { colors, spacing } = useAppTheme();
  const { t } = useTranslation('chrome');
  const { t: tc } = useTranslation('content');
  const { activeLocale, activeTradition } = useSettings();
  const sessionId = useRef<string | null>(null);
  const [energyEvent, setEnergyEvent] = useState<EnergyEventInfo | null>(null);

  useEffect(() => {
    if (!program.energyScriptSlug) return;
    let active = true;
    getEnergyScript(program.energyScriptSlug).then((s) => {
      if (active) setEnergyEvent(s?.events?.[0] ?? null);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let active = true;
    createSession({
      templateSlug: program.templateSlug,
      localeUsed: activeLocale,
      traditionUsed: activeTradition,
    }).then((id) => {
      if (!active) return;
      sessionId.current = id;
      logSessionEvent(id, 'start', { template: program.templateSlug });
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPhaseChange = useCallback(
    (phase: ProgramPhase) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      AccessibilityInfo.announceForAccessibility(t(`session.${captionKey(phase.type)}`));
    },
    [t],
  );

  const onComplete = useCallback(() => {
    const id = sessionId.current;
    if (id) {
      logSessionEvent(id, 'complete');
      endSession(id, 'completed');
    }
    router.replace({ pathname: '/session/complete', params: { sessionId: id ?? '' } });
  }, []);

  const engine = useBreathEngine(program.phases, program.durationSec, { onPhaseChange, onComplete });

  const log = useCallback((type: string) => {
    if (sessionId.current) logSessionEvent(sessionId.current, type);
  }, []);

  const onStop = useCallback(() => {
    engine.stop();
    const id = sessionId.current;
    if (id) {
      logSessionEvent(id, 'stop');
      endSession(id, 'stopped');
    }
    router.back();
  }, [engine]);

  const togglePause = useCallback(() => {
    if (engine.status === 'paused') {
      engine.resume();
      log('resume');
    } else {
      engine.pause();
      log('pause');
    }
  }, [engine, log]);

  const onSlow = useCallback(() => {
    engine.toggleSlow();
    log('slow');
  }, [engine, log]);

  const caption =
    engine.status === 'paused'
      ? t('session.paused')
      : t(`session.${captionKey(engine.phase.type)}`);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('session.stop')}
        onPress={onStop}
        style={styles.close}>
        <Ionicons name="close" size={28} color={colors.textLo} />
      </Pressable>

      <View style={styles.center}>
        {energyEvent ? (
          <EnergyOverlay engine={engine} event={energyEvent} />
        ) : (
          <BreathOrb engine={engine} />
        )}
        <AppText
          variant="display"
          lang={activeLocale}
          accessibilityLiveRegion="polite"
          style={{ marginTop: spacing.lg, textAlign: 'center' }}>
          {caption}
        </AppText>
        {energyEvent && engine.phase.seq === energyEvent.atPhaseSeq ? (
          <AppText
            variant="caption"
            color="accent"
            lang={activeLocale}
            accessibilityLiveRegion="polite"
            style={{ marginTop: spacing.xs, textAlign: 'center' }}>
            {tc(energyEvent.labelKey)}
          </AppText>
        ) : null}
        <AppText variant="caption" color="lo" style={{ marginTop: spacing.sm }}>
          {fmt(engine.remainingSec)}
        </AppText>
      </View>

      <View style={[styles.controls, { paddingBottom: spacing.xxxl }]}>
        <ControlButton
          icon={engine.status === 'paused' ? 'play' : 'pause'}
          label={engine.status === 'paused' ? t('session.resume') : t('session.pause')}
          onPress={togglePause}
        />
        <ControlButton
          icon="hourglass-outline"
          label={t('session.slow')}
          active={engine.slow}
          onPress={onSlow}
        />
      </View>
    </View>
  );
}

function ControlButton({
  icon,
  label,
  onPress,
  active,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  active?: boolean;
}) {
  const { colors, spacing, radius } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!active }}
      onPress={onPress}
      style={[
        styles.control,
        {
          backgroundColor: active ? colors.accent : colors.surface,
          borderColor: colors.border,
          borderRadius: radius.pill,
          paddingHorizontal: spacing.lg,
        },
      ]}>
      <Ionicons name={icon} size={20} color={active ? colors.bg : colors.textHi} />
      <AppText variant="label" style={{ color: active ? colors.bg : colors.textHi, marginLeft: 8 }}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 56 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  close: { position: 'absolute', top: 56, right: 20, zIndex: 2, padding: 8 },
  controls: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  control: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
});
