import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { type ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { AppText } from '@/components/ui/text';
import { GOAL_META, GOAL_ORDER } from '@/domain/goals';
import { useAppTheme } from '@/theme/ThemeProvider';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export default function ExploreScreen() {
  const { colors, spacing, radius } = useAppTheme();

  return (
    <Screen>
      <AppText variant="title">Explore</AppText>
      <AppText variant="body" color="lo" style={{ marginTop: spacing.xs }}>
        Browse by goal. Each practice can be experienced as Body &amp; Breath, Felt Sense, or within
        its Tradition.
      </AppText>

      <View style={[styles.grid, { marginTop: spacing.xl }]}>
        {GOAL_ORDER.map((g) => (
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '47%', padding: 16, borderWidth: StyleSheet.hairlineWidth },
});
