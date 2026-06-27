import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { AppText } from '@/components/ui/text';
import { CHAKRAS, NADIS } from '@/theme/palettes';
import { useAppTheme } from '@/theme/ThemeProvider';

export default function TraditionScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { colors, spacing, radius } = useAppTheme();

  if (slug !== 'yogic') {
    return (
      <Screen>
        <Stack.Screen options={{ headerShown: true, title: '' }} />
        <AppText variant="title">{slug ?? 'Tradition'}</AppText>
        <AppText variant="body" color="lo" style={{ marginTop: spacing.md }}>
          This tradition ships as a downloadable pack in a later release.
        </AppText>
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: 'Yogic' }} />
      <AppText variant="title">Yogic</AppText>
      <AppText variant="body" color="lo" style={{ marginTop: spacing.xs }}>
        Prāṇa is the vital life-force of which breath is the grossest expression; prāṇāyāma works with
        it through channels (nāḍīs) and centers (chakras).
      </AppText>

      <View
        style={[
          styles.badge,
          { backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderRadius: radius.md },
        ]}>
        <AppText variant="caption" color="lo">
          A contemplative, belief-based model of felt experience — not a measured anatomical or
          medical structure.
        </AppText>
      </View>

      <AppText variant="heading" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>
        The seven chakras
      </AppText>
      <View
        style={[
          styles.note,
          { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md },
        ]}>
        <AppText variant="caption" color="accent">
          Modern color system
        </AppText>
        <AppText variant="caption" color="lo" style={{ marginTop: 2 }}>
          The familiar rainbow palette is a ~1977 Western synthesis. Classical sources give different,
          element-derived colors (shown per center below).
        </AppText>
      </View>

      <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
        {CHAKRAS.map((c) => (
          <View
            key={c.slug}
            style={[
              styles.row,
              { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md },
            ]}>
            <View style={[styles.swatch, { backgroundColor: c.modernColor }]} />
            <View style={{ flex: 1 }}>
              <AppText variant="heading">
                {c.name} · {c.sanskrit}
              </AppText>
              <AppText variant="caption" color="lo">
                {c.element} · {c.petals} petals · bīja {c.bija || '—'}
              </AppText>
              <AppText variant="caption" color="lo" style={{ marginTop: 2 }}>
                Classical: {c.classicalNote}
              </AppText>
            </View>
          </View>
        ))}
      </View>

      <AppText variant="heading" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>
        The three principal nāḍīs
      </AppText>
      <View style={{ gap: spacing.sm }}>
        {NADIS.map((n) => (
          <View key={n.slug} style={styles.nadiRow}>
            <View style={[styles.swatch, { backgroundColor: n.color }]} />
            <AppText variant="body">
              {n.name} — {n.polarity}
            </AppText>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  badge: { marginTop: 16, padding: 12, borderWidth: StyleSheet.hairlineWidth },
  note: { padding: 12, borderWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 12, borderWidth: StyleSheet.hairlineWidth },
  nadiRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  swatch: { width: 18, height: 18, borderRadius: 9, marginTop: 2 },
});
