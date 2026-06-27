import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { AppText } from '@/components/ui/text';
import { useTraditions } from '@/db/hooks';
import { useSettings } from '@/providers/SettingsProvider';
import { useAppTheme } from '@/theme/ThemeProvider';

export default function OnboardingTradition() {
  const { t } = useTranslation('chrome');
  const { t: tc } = useTranslation('content');
  const { colors, spacing, radius } = useAppTheme();
  const { setActiveTradition } = useSettings();
  const { data: traditions } = useTraditions();

  return (
    <Screen>
      <AppText variant="title">{t('onboarding.choosePackTitle')}</AppText>
      <AppText variant="body" color="lo" style={{ marginTop: spacing.xs }}>
        {t('onboarding.choosePackBody')}
      </AppText>

      <View style={{ marginTop: spacing.xl, gap: spacing.sm }}>
        {(traditions ?? []).map((tr) => (
          <Pressable
            key={tr.slug}
            accessibilityRole="button"
            onPress={async () => {
              await setActiveTradition(tr.slug);
              router.push('/onboarding/language');
            }}
            style={[
              styles.row,
              { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md },
            ]}>
            <AppText variant="heading">{tc(tr.displayNameKey)}</AppText>
            <AppText variant="caption" color="lo" style={{ marginTop: 2 }}>
              {tc(tr.cosmologySummaryKey)}
            </AppText>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { padding: 16, borderWidth: StyleSheet.hairlineWidth },
});
