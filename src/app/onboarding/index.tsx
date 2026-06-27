import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { DisclaimerBody } from '@/components/disclaimer-body';
import { Screen } from '@/components/screen';
import { AppText } from '@/components/ui/text';
import { useAppTheme } from '@/theme/ThemeProvider';

export default function OnboardingDisclaimer() {
  const { t } = useTranslation('chrome');
  const { colors, spacing, radius } = useAppTheme();

  return (
    <Screen>
      <AppText variant="display">{t('onboarding.welcomeTitle')}</AppText>
      <AppText variant="body" color="lo" style={{ marginTop: spacing.sm }}>
        {t('onboarding.welcomeBody')}
      </AppText>

      <DisclaimerBody />

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/onboarding/tradition')}
        style={[styles.cta, { backgroundColor: colors.accent, borderRadius: radius.pill }]}>
        <AppText variant="heading" style={{ color: colors.bg }}>
          {t('onboarding.disclaimerContinue')}
        </AppText>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cta: { marginTop: 28, paddingVertical: 16, alignItems: 'center' },
});
