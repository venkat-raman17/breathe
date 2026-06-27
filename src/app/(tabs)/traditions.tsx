import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { AppText } from '@/components/ui/text';
import { useAppTheme } from '@/theme/ThemeProvider';

interface GalleryEntry {
  slug: string;
  name: string;
  subtitle: string;
  available: boolean;
}

// v1 ships the Yogic tradition fully; others arrive as downloadable packs (docs §5.2).
const GALLERY: GalleryEntry[] = [
  { slug: 'yogic', name: 'Yogic', subtitle: 'Prāṇa · chakras · nāḍīs · kuṇḍalinī', available: true },
  { slug: 'daoist', name: 'Daoist', subtitle: 'Qì · dāntián · microcosmic orbit', available: false },
  { slug: 'tibetan', name: 'Tibetan', subtitle: 'Tsa-lung · tummo · channels & winds', available: false },
  { slug: 'zen_hara', name: 'Zen / Hara', subtitle: 'Ki · tanden · zazen breath', available: false },
  { slug: 'sufi', name: 'Sufi', subtitle: 'Nafas · dhikr · the lataif', available: false },
];

export default function TraditionsScreen() {
  const { colors, spacing, radius } = useAppTheme();

  return (
    <Screen>
      <AppText variant="title">Traditions</AppText>
      <AppText variant="body" color="lo" style={{ marginTop: spacing.xs }}>
        Living traditions of breath and energy — presented as belief and felt experience, with honest
        provenance, never as medical fact.
      </AppText>

      <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
        {GALLERY.map((t) => {
          const body = (
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.lg,
                  opacity: t.available ? 1 : 0.6,
                },
              ]}>
              <View style={styles.cardHead}>
                <AppText variant="heading">{t.name}</AppText>
                {!t.available && (
                  <AppText variant="caption" color="lo">
                    Pack coming soon
                  </AppText>
                )}
              </View>
              <AppText variant="caption" color="lo" style={{ marginTop: spacing.xs }}>
                {t.subtitle}
              </AppText>
            </View>
          );

          if (!t.available) {
            return (
              <View key={t.slug} accessibilityLabel={`${t.name}. Pack coming soon.`}>
                {body}
              </View>
            );
          }
          return (
            <Pressable
              key={t.slug}
              accessibilityRole="button"
              accessibilityLabel={`Open the ${t.name} tradition`}
              onPress={() => router.push({ pathname: '/traditions/[slug]', params: { slug: t.slug } })}>
              {body}
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderWidth: StyleSheet.hairlineWidth },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
