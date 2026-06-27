import { Stack, useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/screen';
import { AppText } from '@/components/ui/text';
import { GOAL_CODES, type GoalCode } from '@/domain/enums';
import { GOAL_META } from '@/domain/goals';
import { useAppTheme } from '@/theme/ThemeProvider';

export default function GoalScreen() {
  const { goalCode } = useLocalSearchParams<{ goalCode: string }>();
  const code = (GOAL_CODES as readonly string[]).includes(goalCode ?? '')
    ? (goalCode as GoalCode)
    : undefined;
  const meta = code ? GOAL_META[code] : undefined;
  const { spacing } = useAppTheme();

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: meta?.label ?? 'Goal' }} />
      <AppText variant="title">{meta?.label ?? 'Goal'}</AppText>
      {meta && (
        <AppText variant="body" color="lo" style={{ marginTop: spacing.xs }}>
          {meta.tagline}
        </AppText>
      )}
      <AppText variant="body" color="lo" style={{ marginTop: spacing.xl }}>
        Practices for this goal will appear here once the core content library is seeded (Phase 3).
      </AppText>
    </Screen>
  );
}
