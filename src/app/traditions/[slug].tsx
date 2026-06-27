import { router, Stack, useLocalSearchParams, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { EnergyBodyMap } from '@/components/energy-body-map';
import { Screen } from '@/components/screen';
import { AppText } from '@/components/ui/text';
import {
  useEnergyChannels,
  useEnergyCenters,
  useTechniquesForTradition,
  useTradition,
} from '@/db/hooks';
import { useSettings } from '@/providers/SettingsProvider';
import { useAppTheme } from '@/theme/ThemeProvider';

export default function TraditionScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { activeLocale } = useSettings();
  const { t } = useTranslation('chrome');
  const { t: tc } = useTranslation('content');
  const { colors, spacing, radius } = useAppTheme();

  const { data: tradition } = useTradition(slug);
  const { data: centers } = useEnergyCenters(slug);
  const { data: channels } = useEnergyChannels(slug);
  const { data: techniques } = useTechniquesForTradition(slug);

  const title = tradition ? tc(tradition.displayNameKey) : '';
  const hasModern = (centers ?? []).some((c) => c.colorProvenance === 'modern_rainbow');
  const swatch = (token: string) => (/^#([0-9a-fA-F]{3,8})$/.test(token) ? token : colors.accent);

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title }} />
      <AppText variant="title" lang={activeLocale}>
        {title}
      </AppText>
      {tradition ? (
        <>
          <AppText variant="body" color="lo" style={{ marginTop: spacing.xs }}>
            {tc(tradition.cosmologySummaryKey)}
          </AppText>
          <View
            style={[
              styles.badge,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderRadius: radius.md },
            ]}>
            <AppText variant="caption" color="lo">
              {tc(tradition.beliefLabelKey)}
            </AppText>
          </View>
        </>
      ) : null}

      {(centers ?? []).length > 0 || (channels ?? []).length > 0 ? (
        <>
          <AppText variant="heading" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>
            {t('learn.energyBody')}
          </AppText>
          <EnergyBodyMap centers={centers ?? []} channels={channels ?? []} />
        </>
      ) : null}

      {hasModern ? (
        <View
          style={[
            styles.note,
            { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md },
          ]}>
          <AppText variant="caption" color="accent">
            {t('learn.modernColors')}
          </AppText>
          <AppText variant="caption" color="lo" style={{ marginTop: 2 }}>
            {t('learn.modernColorsNote')}
          </AppText>
        </View>
      ) : null}

      {(centers ?? []).length > 0 ? (
        <>
          <AppText variant="heading" style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>
            {t('learn.centers')}
          </AppText>
          <View style={{ gap: spacing.sm }}>
            {(centers ?? []).map((c) => (
              <Pressable
                key={c.slug}
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: '/traditions/[slug]/center/[centerSlug]',
                    params: { slug, centerSlug: c.slug },
                  })
                }
                style={[
                  styles.row,
                  { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md },
                ]}>
                <View style={[styles.swatch, { backgroundColor: swatch(c.colorToken) }]} />
                <View style={{ flex: 1 }}>
                  <AppText variant="heading" lang={activeLocale}>
                    {tc(c.displayNameKey)}
                  </AppText>
                  {c.elementKey ? (
                    <AppText variant="caption" color="lo">
                      {tc(c.elementKey)}
                      {c.petalCount != null ? ` · ${c.petalCount} ${t('learn.petals')}` : ''}
                    </AppText>
                  ) : null}
                </View>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      {(channels ?? []).length > 0 ? (
        <>
          <AppText variant="heading" style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>
            {t('learn.channels')}
          </AppText>
          <View style={{ gap: spacing.sm }}>
            {(channels ?? []).map((ch) => (
              <View key={ch.slug} style={styles.channelRow}>
                <View style={[styles.swatch, { backgroundColor: swatch(ch.colorToken) }]} />
                <AppText variant="body" lang={activeLocale}>
                  {tc(ch.displayNameKey)}
                  {ch.polarityKey ? ` — ${tc(ch.polarityKey)}` : ''}
                </AppText>
              </View>
            ))}
          </View>
        </>
      ) : null}

      {(techniques ?? []).length > 0 ? (
        <>
          <AppText variant="heading" style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>
            {t('learn.practices')}
          </AppText>
          <View style={{ gap: spacing.sm }}>
            {(techniques ?? []).map((tech) => (
              <Pressable
                key={tech.slug}
                accessibilityRole="button"
                onPress={() =>
                  // Typed-routes generator currently omits this nested route literal; cast is safe
                  // (route is registered and bundles fine).
                  router.push(`/traditions/${slug}/practice/${tech.slug}` as Href)
                }
                style={[
                  styles.row,
                  { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md },
                ]}>
                <View style={{ flex: 1 }}>
                  <AppText variant="heading" lang={activeLocale}>
                    {tc(tech.canonicalNameKey)}
                  </AppText>
                  <AppText variant="caption" color="lo">
                    {tc(tech.summaryKey)}
                  </AppText>
                </View>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  badge: { marginTop: 16, padding: 12, borderWidth: StyleSheet.hairlineWidth },
  note: { marginTop: 12, padding: 12, borderWidth: StyleSheet.hairlineWidth },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  channelRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  swatch: { width: 18, height: 18, borderRadius: 9, marginTop: 2 },
});
