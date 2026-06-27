import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { type ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { AppText } from '@/components/ui/text';
import { GOAL_META } from '@/domain/goals';
import type { GoalCode } from '@/domain/enums';
import { useAppTheme } from '@/theme/ThemeProvider';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const QUICK_GOALS: GoalCode[] = ['calm', 'sleep', 'focus', 'energy'];

export default function HomeScreen() {
  const { colors, spacing, radius } = useAppTheme();

  return (
    <Screen>
      <AppText variant="caption" color="lo">
        Welcome
      </AppText>
      <AppText variant="display">Breathe</AppText>
      <AppText variant="body" color="lo" style={{ marginTop: spacing.xs }}>
        Breath and energy across the world&rsquo;s living traditions.
      </AppText>

      <AppText variant="heading" style={{ marginTop: spacing.xxl, marginBottom: spacing.md }}>
        Begin
      </AppText>
      <View style={styles.grid}>
        {QUICK_GOALS.map((g) => (
          <Pressable
            key={g}
            accessibilityRole="button"
            accessibilityLabel={`${GOAL_META[g].label}. ${GOAL_META[g].tagline}`}
            onPress={() => router.push({ pathname: '/explore/goal/[goalCode]', params: { goalCode: g } })}
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg },
            ]}>
            <Ionicons name={GOAL_META[g].icon as IoniconName} size={22} color={colors.accent} />
            <AppText variant="heading" style={{ marginTop: spacing.sm }}>
              {GOAL_META[g].label}
            </AppText>
            <AppText variant="caption" color="lo">
              {GOAL_META[g].tagline}
            </AppText>
          </Pressable>
        ))}
      </View>

      <Pressable
        accessibilityRole="link"
        onPress={() => router.push('/modal/disclaimer')}
        style={{ marginTop: spacing.xxl }}>
        <AppText variant="caption" color="lo">
          Breathe is for well-being, education, and contemplative practice — not medical advice. Learn
          more.
        </AppText>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '47%', padding: 16, borderWidth: StyleSheet.hairlineWidth },
});
