import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { Screen } from '@/components/screen';
import { AppText } from '@/components/ui/text';
import { useAppTheme } from '@/theme/ThemeProvider';

export default function TechniqueDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { colors, spacing, radius } = useAppTheme();

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: '' }} />
      <AppText variant="title">{slug ?? 'Technique'}</AppText>
      <AppText variant="body" color="lo" style={{ marginTop: spacing.xs }}>
        Technique detail (summary, how it&rsquo;s practiced, how it should feel, and safety) will be
        populated from the content library.
      </AppText>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Start practice"
        onPress={() =>
          router.push({ pathname: '/session/[templateId]', params: { templateId: slug ?? 'demo' } })
        }
        style={[styles.cta, { backgroundColor: colors.accent, borderRadius: radius.pill }]}>
        <AppText variant="heading" style={{ color: colors.bg }}>
          Start practice
        </AppText>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cta: { marginTop: 28, paddingVertical: 16, alignItems: 'center' },
});
