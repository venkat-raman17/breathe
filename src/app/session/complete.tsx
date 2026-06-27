import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { BodyMap, type BodyGlow } from '@/components/body-map';
import { Screen } from '@/components/screen';
import { AppText } from '@/components/ui/text';
import { useBodyRegions, useFeltVocab } from '@/db/hooks';
import { saveReflection, type ReflectionEntryInput } from '@/db/repo';
import { useSettings } from '@/providers/SettingsProvider';
import { useAppTheme } from '@/theme/ThemeProvider';

interface Entry {
  intensity: number;
  qualityCode?: string;
}

export default function SessionCompleteScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const { activeLocale } = useSettings();
  const { t } = useTranslation('chrome');
  const { t: tc } = useTranslation('content');
  const { colors, spacing, radius } = useAppTheme();
  const { data: regions } = useBodyRegions();
  const { data: vocab } = useFeltVocab();

  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const vocabByCode = useMemo(() => {
    const m = new Map<string, { colorTemp: string; valence: number }>();
    (vocab ?? []).forEach((v) => m.set(v.code, { colorTemp: v.colorTemp, valence: v.valenceDefault }));
    return m;
  }, [vocab]);

  const glows: BodyGlow[] = useMemo(
    () =>
      Object.entries(entries).map(([code, e]) => ({
        regionCode: code,
        intensity: e.intensity,
        colorTemp: e.qualityCode ? vocabByCode.get(e.qualityCode)?.colorTemp : undefined,
      })),
    [entries, vocabByCode],
  );

  const regionCodes = (regions ?? []).map((r) => r.code);
  const selectedEntry = selected ? entries[selected] : undefined;

  const onSelectRegion = (code: string) => {
    setSelected(code);
    setEntries((prev) => (prev[code] ? prev : { ...prev, [code]: { intensity: 1 } }));
  };
  const setQuality = (q: string) => {
    if (!selected) return;
    setEntries((prev) => ({ ...prev, [selected]: { ...prev[selected], qualityCode: q } }));
  };
  const setIntensity = (n: number) => {
    if (!selected) return;
    setEntries((prev) => ({ ...prev, [selected]: { ...prev[selected], intensity: n } }));
  };
  const removeSelected = () => {
    if (!selected) return;
    setEntries((prev) => {
      const next = { ...prev };
      delete next[selected];
      return next;
    });
    setSelected(null);
  };

  const onSave = async () => {
    if (saving) return;
    setSaving(true);
    const payload: ReflectionEntryInput[] = Object.entries(entries).map(([code, e]) => ({
      regionCode: code,
      intensity: e.intensity,
      qualityCode: e.qualityCode,
      valence: e.qualityCode ? (vocabByCode.get(e.qualityCode)?.valence ?? 0) : 0,
    }));
    try {
      if (sessionId) await saveReflection(sessionId, payload, note);
    } catch (err) {
      console.warn('[breathe] saveReflection failed', err);
    }
    router.replace('/(tabs)/reflect');
  };

  return (
    <Screen>
      <AppText variant="title">{t('session.complete')}</AppText>
      <AppText variant="heading" style={{ marginTop: spacing.sm }}>
        {t('reflect.prompt')}
      </AppText>
      <AppText variant="caption" color="lo" style={{ marginTop: spacing.xs }}>
        {t('reflect.intro')}
      </AppText>

      <View style={{ marginTop: spacing.lg }}>
        <BodyMap
          mode="capture"
          regions={regionCodes}
          glows={glows}
          selected={selected}
          onSelectRegion={onSelectRegion}
        />
      </View>

      {selected ? (
        <View style={{ marginTop: spacing.lg }}>
          <AppText variant="caption" color="lo">
            {t('reflect.quality')}
          </AppText>
          <View style={[styles.chips, { marginTop: spacing.sm }]}>
            {(vocab ?? []).map((v) => {
              const active = selectedEntry?.qualityCode === v.code;
              return (
                <Pressable
                  key={v.code}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setQuality(v.code)}
                  style={[
                    styles.chip,
                    { backgroundColor: active ? colors.accent : colors.surface, borderColor: colors.border, borderRadius: radius.pill },
                  ]}>
                  <AppText variant="label" lang={activeLocale} style={{ color: active ? colors.bg : colors.textHi }}>
                    {tc(v.displayNameKey)}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <AppText variant="caption" color="lo" style={{ marginTop: spacing.lg }}>
            {t('reflect.intensity')}
          </AppText>
          <View style={[styles.chips, { marginTop: spacing.sm }]}>
            {[1, 2, 3].map((n) => {
              const active = (selectedEntry?.intensity ?? 1) === n;
              return (
                <Pressable
                  key={n}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setIntensity(n)}
                  style={[
                    styles.dot,
                    { backgroundColor: active ? colors.accent : colors.surface, borderColor: colors.border },
                  ]}>
                  <AppText variant="label" style={{ color: active ? colors.bg : colors.textLo }}>
                    {n}
                  </AppText>
                </Pressable>
              );
            })}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Remove"
              onPress={removeSelected}
              style={[styles.chip, { borderColor: colors.border, borderRadius: radius.pill }]}>
              <AppText variant="label" color="lo">
                ✕
              </AppText>
            </Pressable>
          </View>
        </View>
      ) : null}

      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder={t('reflect.notePlaceholder')}
        placeholderTextColor={colors.textLo}
        multiline
        style={[
          styles.note,
          { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, color: colors.textHi },
        ]}
      />

      <Pressable
        accessibilityRole="button"
        onPress={onSave}
        style={[styles.cta, { backgroundColor: colors.accent, borderRadius: radius.pill }]}>
        <AppText variant="heading" style={{ color: colors.bg }}>
          {t('reflect.save')}
        </AppText>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => router.replace('/(tabs)')} style={styles.skip}>
        <AppText variant="label" color="lo">
          {t('reflect.skip')}
        </AppText>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderWidth: StyleSheet.hairlineWidth },
  dot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  note: { marginTop: 24, minHeight: 80, padding: 12, borderWidth: StyleSheet.hairlineWidth, textAlignVertical: 'top' },
  cta: { marginTop: 20, paddingVertical: 16, alignItems: 'center' },
  skip: { marginTop: 8, paddingVertical: 12, alignItems: 'center' },
});
