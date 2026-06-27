import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { Screen } from '@/components/screen';
import { AppText } from '@/components/ui/text';
import { useAppTheme } from '@/theme/ThemeProvider';

export default function SessionCompleteScreen() {
  const { colors, spacing, radius } = useAppTheme();

  return (
    <Screen>
      <AppText variant="title">Complete</AppText>
      <AppText variant="body" color="lo" style={{ marginTop: spacing.xs }}>
        The reflection flow — a felt-sense body map and an optional note — arrives in Phase 2.
      </AppText>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={[styles.cta, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.pill }]}>
        <AppText variant="heading">Done</AppText>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cta: { marginTop: 28, paddingVertical: 14, alignItems: 'center', borderWidth: StyleSheet.hairlineWidth },
});
