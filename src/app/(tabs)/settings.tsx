import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { AppText } from '@/components/ui/text';
import { useA11y } from '@/providers/A11yProvider';
import { useAppTheme } from '@/theme/ThemeProvider';

const REDUCE_MOTION_OPTIONS: { value: 'system' | boolean; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: true, label: 'On' },
  { value: false, label: 'Off' },
];

export default function SettingsScreen() {
  const { colors, spacing, radius } = useAppTheme();
  const { reduceMotion, reduceMotionOverride, setReduceMotionOverride } = useA11y();

  return (
    <Screen>
      <AppText variant="title">Settings</AppText>

      <AppText variant="caption" color="lo" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>
        EXPERIENCE
      </AppText>
      <View
        style={[
          styles.block,
          { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg },
        ]}>
        <AppText variant="heading">Reduce motion</AppText>
        <AppText variant="caption" color="lo" style={{ marginTop: spacing.xs, marginBottom: spacing.md }}>
          Replaces flowing energy animations with gentle fades. Currently {reduceMotion ? 'on' : 'off'}.
        </AppText>
        <View style={[styles.segRow, { borderColor: colors.border, borderRadius: radius.pill }]}>
          {REDUCE_MOTION_OPTIONS.map((opt) => {
            const active = reduceMotionOverride === opt.value;
            return (
              <Pressable
                key={String(opt.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                onPress={() => setReduceMotionOverride(opt.value)}
                style={[
                  styles.seg,
                  { borderRadius: radius.pill, backgroundColor: active ? colors.accent : 'transparent' },
                ]}>
                <AppText variant="label" style={{ color: active ? colors.bg : colors.textLo }}>
                  {opt.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <AppText variant="caption" color="lo" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>
        SAFETY &amp; INFORMATION
      </AppText>
      <View
        style={[
          styles.block,
          { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, padding: 0 },
        ]}>
        <SettingsRow
          icon="shield-checkmark-outline"
          title="About Breathe"
          subtitle="Non-medical disclaimer & how to read belief-based content"
          onPress={() => router.push('/modal/disclaimer')}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <SettingsRow
          icon="book-outline"
          title="Glossary"
          subtitle="Sanskrit and cross-tradition terms"
          onPress={() => router.push('/modal/glossary')}
        />
      </View>
    </Screen>
  );
}

function SettingsRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  const { colors, spacing } = useAppTheme();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}>
      <Ionicons name={icon} size={22} color={colors.accent} />
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <AppText variant="heading">{title}</AppText>
        <AppText variant="caption" color="lo">
          {subtitle}
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textLo} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  block: { padding: 16, borderWidth: StyleSheet.hairlineWidth },
  segRow: { flexDirection: 'row', padding: 4, borderWidth: StyleSheet.hairlineWidth, alignSelf: 'flex-start' },
  seg: { paddingVertical: 8, paddingHorizontal: 18 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 52 },
});
