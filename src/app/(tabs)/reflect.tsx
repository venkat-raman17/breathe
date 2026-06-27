import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { BodyMap, type BodyGlow } from '@/components/body-map';
import { Screen } from '@/components/screen';
import { AppText } from '@/components/ui/text';
import { useFeltVocab, useRecentReflections } from '@/db/hooks';
import { useAppTheme } from '@/theme/ThemeProvider';

export default function ReflectScreen() {
  const { t } = useTranslation('chrome');
  const { colors, spacing, radius } = useAppTheme();
  const { data: reflections, reload } = useRecentReflections();
  const { data: vocab } = useFeltVocab();

  // Refresh when the tab regains focus (a reflection may have just been saved).
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const tempByCode = useMemo(() => {
    const m = new Map<string, string>();
    (vocab ?? []).forEach((v) => m.set(v.code, v.colorTemp));
    return m;
  }, [vocab]);

  const items = (reflections ?? []).filter((r) => r.entries.length > 0);

  return (
    <Screen>
      <AppText variant="title">{t('reflect.title')}</AppText>

      {items.length === 0 ? (
        <View
          style={[
            styles.empty,
            { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg },
          ]}>
          <Ionicons name="body-outline" size={40} color={colors.textLo} />
          <AppText variant="heading" style={{ marginTop: spacing.md }}>
            {t('reflect.empty')}
          </AppText>
          <AppText variant="caption" color="lo" style={{ textAlign: 'center', marginTop: spacing.xs }}>
            {t('reflect.emptyBody')}
          </AppText>
        </View>
      ) : (
        <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
          {items.map((r) => {
            const glows: BodyGlow[] = r.entries.map((e) => ({
              regionCode: e.regionCode,
              intensity: e.intensity,
              colorTemp: e.qualityTags[0] ? tempByCode.get(e.qualityTags[0]) : undefined,
            }));
            const date = new Date(r.startedAt);
            return (
              <View
                key={r.id}
                style={[
                  styles.card,
                  { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg },
                ]}>
                <View style={{ flex: 1 }}>
                  <AppText variant="heading">{date.toLocaleDateString()}</AppText>
                  <AppText variant="caption" color="lo">
                    {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ·{' '}
                    {r.entries.length} {t('reflect.areasNoted')}
                  </AppText>
                  {r.notes ? (
                    <AppText variant="caption" color="lo" style={{ marginTop: spacing.xs }}>
                      {r.notes}
                    </AppText>
                  ) : null}
                </View>
                <View style={{ width: 84 }}>
                  <BodyMap mode="view" glows={glows} maxWidth={84} />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { marginTop: 28, padding: 28, alignItems: 'center', borderWidth: StyleSheet.hairlineWidth },
  card: { flexDirection: 'row', gap: 12, padding: 16, borderWidth: StyleSheet.hairlineWidth },
});
