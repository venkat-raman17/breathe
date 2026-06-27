import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { AppText } from '@/components/ui/text';
import { useEnergyCenter } from '@/db/hooks';
import { useSettings } from '@/providers/SettingsProvider';
import { useAppTheme } from '@/theme/ThemeProvider';

export default function CenterDetailScreen() {
  const { centerSlug } = useLocalSearchParams<{ slug: string; centerSlug: string }>();
  const { activeLocale } = useSettings();
  const { t } = useTranslation('chrome');
  const { t: tc } = useTranslation('content');
  const { colors, spacing, radius } = useAppTheme();
  const { data: c } = useEnergyCenter(centerSlug);

  const name = c ? tc(c.displayNameKey) : '';
  const swatch = c && /^#([0-9a-fA-F]{3,8})$/.test(c.colorToken) ? c.colorToken : colors.accent;

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: name }} />
      {c ? (
        <>
          <View style={[styles.hero, { backgroundColor: swatch, borderRadius: radius.lg }]} />
          <AppText variant="title" lang={activeLocale} style={{ marginTop: spacing.md }}>
            {name}
          </AppText>

          <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
            {c.elementKey ? <Fact label={t('learn.element')} value={tc(c.elementKey)} lang={activeLocale} /> : null}
            {c.petalCount != null ? <Fact label={t('learn.petals')} value={String(c.petalCount)} /> : null}
            {c.seedSyllableKey ? (
              <Fact label={t('learn.seedSound')} value={tc(c.seedSyllableKey)} lang={activeLocale} />
            ) : null}
            {c.feltQualities.length > 0 ? (
              <Fact label={t('learn.feltAs')} value={c.feltQualities.join(', ')} />
            ) : null}
          </View>

          {c.notesKey ? (
            <View
              style={[
                styles.note,
                { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md },
              ]}>
              <AppText variant="caption" color="lo">
                {tc(c.notesKey)}
              </AppText>
            </View>
          ) : null}
        </>
      ) : (
        <AppText variant="body" color="lo">
          {t('common.loading')}
        </AppText>
      )}
    </Screen>
  );
}

function Fact({ label, value, lang }: { label: string; value: string; lang?: string }) {
  const { colors, spacing, radius } = useAppTheme();
  return (
    <View
      style={[
        styles.fact,
        { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md },
      ]}>
      <AppText variant="caption" color="lo">
        {label}
      </AppText>
      <AppText variant="body" lang={lang} style={{ marginTop: 2 }}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: 96, width: '100%', opacity: 0.85 },
  fact: { padding: 12, borderWidth: StyleSheet.hairlineWidth },
  note: { marginTop: 16, padding: 12, borderWidth: StyleSheet.hairlineWidth },
});
