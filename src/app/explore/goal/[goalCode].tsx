import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { AppText } from '@/components/ui/text';
import { useTechniquesForGoal } from '@/db/hooks';
import { GOAL_CODES, type GoalCode } from '@/domain/enums';
import { GOAL_META } from '@/domain/goals';
import { useSettings } from '@/providers/SettingsProvider';
import { useAppTheme } from '@/theme/ThemeProvider';

export default function GoalScreen() {
  const { goalCode } = useLocalSearchParams<{ goalCode: string }>();
  const code = (GOAL_CODES as readonly string[]).includes(goalCode ?? '')
    ? (goalCode as GoalCode)
    : undefined;
  const meta = code ? GOAL_META[code] : undefined;

  const { activeLocale } = useSettings();
  const { t: tc } = useTranslation('content');
  const { colors, spacing, radius } = useAppTheme();
  const { data: techniques, loading } = useTechniquesForGoal(code);

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: meta?.label ?? 'Goal' }} />
      <AppText variant="title">{meta?.label ?? 'Goal'}</AppText>
      {meta ? (
        <AppText variant="body" color="lo" style={{ marginTop: spacing.xs }}>
          {meta.tagline}
        </AppText>
      ) : null}

      <View style={{ marginTop: spacing.xl, gap: spacing.sm }}>
        {(techniques ?? []).map((tech) => (
          <Pressable
            key={tech.slug}
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/explore/technique/[slug]', params: { slug: tech.slug } })}
            style={[
              styles.row,
              { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md },
            ]}>
            <View style={{ flex: 1 }}>
              <AppText variant="heading" lang={activeLocale}>
                {tc(tech.canonicalNameKey)}
              </AppText>
              <AppText variant="caption" color="lo">
                {tc(tech.summaryKey)}
              </AppText>
            </View>
            {tech.requiresSafetyGate ? (
              <Ionicons name="warning-outline" size={18} color={colors.caution} style={{ marginLeft: 8 }} />
            ) : null}
          </Pressable>
        ))}

        {!loading && (techniques ?? []).length === 0 ? (
          <AppText variant="body" color="lo">
            More practices for this goal are coming soon.
          </AppText>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
