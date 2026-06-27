import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { LanguagePicker } from '@/components/language-picker';
import { Screen } from '@/components/screen';
import { AppText } from '@/components/ui/text';
import { useContentPacks, useTraditions } from '@/db/hooks';
import { LOCALE_LABELS } from '@/i18n';
import { useSettings } from '@/providers/SettingsProvider';
import { useAppTheme } from '@/theme/ThemeProvider';

function withEnglish(locales: string[] | undefined): string[] {
  const ls = locales ?? ['en'];
  return ls.includes('en') ? ls : ['en', ...ls];
}

export default function TraditionsScreen() {
  const { t } = useTranslation('chrome');
  const { t: tc } = useTranslation('content');
  const { colors, spacing, radius } = useAppTheme();
  const { activeTradition, activeLocale, setActiveTradition, setActiveLocale } = useSettings();
  const { data: traditions } = useTraditions();
  const { data: packs } = useContentPacks();

  const activePack = packs?.find((p) => p.traditionSlug === activeTradition);
  const activeLocales = withEnglish(activePack?.availableLocales);

  const openTradition = async (slug: string) => {
    if (slug !== activeTradition) {
      await setActiveTradition(slug);
      const np = withEnglish(packs?.find((p) => p.traditionSlug === slug)?.availableLocales);
      if (!np.includes(activeLocale)) await setActiveLocale('en');
    }
    router.push({ pathname: '/traditions/[slug]', params: { slug } });
  };

  return (
    <Screen>
      <AppText variant="title">{t('traditions.title')}</AppText>
      <AppText variant="body" color="lo" style={{ marginTop: spacing.xs }}>
        {t('traditions.intro')}
      </AppText>

      <AppText variant="caption" color="lo" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>
        {t('traditions.language')}
      </AppText>
      <LanguagePicker locales={activeLocales} active={activeLocale} onSelect={(l) => setActiveLocale(l)} />

      <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
        {(traditions ?? []).map((tr) => {
          const isActive = tr.slug === activeTradition;
          const trLocales = withEnglish(packs?.find((p) => p.traditionSlug === tr.slug)?.availableLocales);
          return (
            <Pressable
              key={tr.slug}
              accessibilityRole="button"
              accessibilityLabel={`${tc(tr.displayNameKey)}${isActive ? `, ${t('traditions.active')}` : ''}`}
              onPress={() => openTradition(tr.slug)}
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: isActive ? colors.accent : colors.border,
                  borderRadius: radius.lg,
                },
              ]}>
              <View style={styles.head}>
                <AppText variant="heading" lang={activeLocale}>
                  {tc(tr.displayNameKey)}
                </AppText>
                {isActive ? (
                  <AppText variant="caption" color="accent">
                    {t('traditions.active')}
                  </AppText>
                ) : null}
              </View>
              <AppText variant="caption" color="lo" style={{ marginTop: spacing.xs }}>
                {tc(tr.cosmologySummaryKey)}
              </AppText>
              <AppText variant="caption" color="lo" style={{ marginTop: spacing.xs }}>
                {trLocales.map((l) => LOCALE_LABELS[l] ?? l).join(' · ')}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderWidth: StyleSheet.hairlineWidth },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
