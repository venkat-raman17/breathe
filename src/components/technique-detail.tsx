/**
 * Shared technique-detail body (used by Explore and the per-tradition practice route). Data-driven
 * via the technique slug; localized through the `content` namespace. Advanced/retention practices
 * route through the safety gate; others go straight to the session player.
 */
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTechnique } from '@/db/hooks';
import { useSettings } from '@/providers/SettingsProvider';
import { useAppTheme } from '@/theme/ThemeProvider';
import { AppText } from './ui/text';

export function TechniqueDetail({ slug }: { slug: string }) {
  const { activeLocale } = useSettings();
  const { t } = useTranslation('chrome');
  const { t: tc } = useTranslation('content');
  const { colors, spacing, radius } = useAppTheme();
  const { data: tech } = useTechnique(slug);

  if (!tech) {
    return (
      <AppText variant="body" color="lo">
        {t('common.loading')}
      </AppText>
    );
  }

  const start = () => {
    if (tech.requiresSafetyGate) {
      router.push({ pathname: '/safety-gate/[techniqueId]', params: { techniqueId: tech.slug } });
    } else {
      router.push({ pathname: '/session/[templateId]', params: { templateId: tech.slug } });
    }
  };

  return (
    <View>
      <AppText variant="title" lang={activeLocale}>
        {tc(tech.canonicalNameKey)}
      </AppText>
      <AppText variant="body" color="lo" style={{ marginTop: spacing.xs }}>
        {tc(tech.summaryKey)}
      </AppText>

      {tech.feltExperienceKey ? (
        <View style={{ marginTop: spacing.lg }}>
          <AppText variant="caption" color="lo">
            {t('learn.feltAs')}
          </AppText>
          <AppText variant="body" style={{ marginTop: 2 }}>
            {tc(tech.feltExperienceKey)}
          </AppText>
        </View>
      ) : null}

      {tech.safetyNotesKey ? (
        <View
          style={[
            styles.safety,
            { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md },
          ]}>
          <AppText variant="label" style={{ color: colors.caution }}>
            Safety
          </AppText>
          <AppText variant="caption" color="lo" style={{ marginTop: 2 }}>
            {tc(tech.safetyNotesKey)}
          </AppText>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        onPress={start}
        style={[styles.cta, { backgroundColor: colors.accent, borderRadius: radius.pill }]}>
        <AppText variant="heading" style={{ color: colors.bg }}>
          {t('learn.beginPractice')}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safety: { marginTop: 20, padding: 14, borderWidth: StyleSheet.hairlineWidth },
  cta: { marginTop: 24, paddingVertical: 16, alignItems: 'center' },
});
