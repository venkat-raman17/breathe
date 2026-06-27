import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { AppText } from '@/components/ui/text';
import { useContentPacks } from '@/db/hooks';
import { LOCALE_LABELS } from '@/i18n';
import { useSettings } from '@/providers/SettingsProvider';
import { useAppTheme } from '@/theme/ThemeProvider';

export default function OnboardingLanguage() {
  const { t } = useTranslation('chrome');
  const { colors, spacing, radius } = useAppTheme();
  const { activeTradition, activeLocale, setActiveLocale, completeOnboarding } = useSettings();
  const { data: packs } = useContentPacks();

  const pack = packs?.find((p) => p.traditionSlug === activeTradition);
  const raw = pack?.availableLocales ?? ['en'];
  const locales = raw.includes('en') ? raw : ['en', ...raw];

  return (
    <Screen>
      <AppText variant="title">{t('onboarding.chooseLanguageTitle')}</AppText>
      <AppText variant="body" color="lo" style={{ marginTop: spacing.xs }}>
        {t('onboarding.chooseLanguageBody')}
      </AppText>

      <View style={{ marginTop: spacing.xl, gap: spacing.sm }}>
        {locales.map((loc) => {
          const active = loc === activeLocale;
          return (
            <Pressable
              key={loc}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              onPress={() => setActiveLocale(loc)}
              style={[
                styles.row,
                {
                  backgroundColor: active ? colors.accent : colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                },
              ]}>
              <AppText variant="heading" lang={loc} style={{ color: active ? colors.bg : colors.textHi }}>
                {LOCALE_LABELS[loc] ?? loc}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={async () => {
          await completeOnboarding();
          router.replace('/(tabs)');
        }}
        style={[styles.cta, { backgroundColor: colors.accent, borderRadius: radius.pill }]}>
        <AppText variant="heading" style={{ color: colors.bg }}>
          {t('onboarding.begin')}
        </AppText>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { padding: 16, borderWidth: StyleSheet.hairlineWidth },
  cta: { marginTop: 28, paddingVertical: 16, alignItems: 'center' },
});
