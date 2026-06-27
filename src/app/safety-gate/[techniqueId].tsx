import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { AppText } from '@/components/ui/text';
import { useAppTheme } from '@/theme/ThemeProvider';

// Breath-mechanics safety, kept separate from belief content and FRAME-INDEPENDENT:
// every intense practice routes through this gate regardless of the chosen mode (docs §8.2).
const HARD_RULES = [
  'Never practice in or near water, or while driving — fainting can be fatal.',
  'Sit or lie down. Do not stand unsupported.',
  'Stop immediately if you feel faint, get tunnel vision, or your hands cramp.',
];

const CONTRAINDICATIONS =
  'If you have cardiovascular disease or uncontrolled high blood pressure, are pregnant, or have epilepsy, glaucoma, recent surgery, severe asthma, or a panic/psychotic condition, please seek medical guidance before practicing.';

export default function SafetyGateScreen() {
  const { techniqueId } = useLocalSearchParams<{ techniqueId: string }>();
  const { colors, spacing, radius } = useAppTheme();

  return (
    <Screen>
      <View style={styles.head}>
        <Ionicons name="warning-outline" size={26} color={colors.caution} />
        <AppText variant="title" style={{ marginLeft: spacing.sm }}>
          Before you begin
        </AppText>
      </View>

      <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
        {HARD_RULES.map((rule) => (
          <View key={rule} style={styles.ruleRow}>
            <Ionicons name="ellipse" size={8} color={colors.caution} style={{ marginTop: 7 }} />
            <AppText variant="body" style={{ flex: 1, marginLeft: spacing.sm }}>
              {rule}
            </AppText>
          </View>
        ))}
      </View>

      <View
        style={[
          styles.block,
          { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md },
        ]}>
        <AppText variant="caption" color="lo">
          {CONTRAINDICATIONS}
        </AppText>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="I understand, continue to the practice"
        onPress={() =>
          router.replace({
            pathname: '/session/[templateId]',
            params: { templateId: techniqueId ?? 'demo' },
          })
        }
        style={[styles.primary, { backgroundColor: colors.accent, borderRadius: radius.pill }]}>
        <AppText variant="heading" style={{ color: colors.bg }}>
          I understand — continue
        </AppText>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={styles.secondary}>
        <AppText variant="label" color="lo">
          Not now
        </AppText>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center' },
  ruleRow: { flexDirection: 'row', alignItems: 'flex-start' },
  block: { marginTop: 20, padding: 14, borderWidth: StyleSheet.hairlineWidth },
  primary: { marginTop: 24, paddingVertical: 16, alignItems: 'center' },
  secondary: { marginTop: 8, paddingVertical: 12, alignItems: 'center' },
});
