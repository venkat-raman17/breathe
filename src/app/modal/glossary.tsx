import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { AppText } from '@/components/ui/text';
import { useAppTheme } from '@/theme/ThemeProvider';

interface Term {
  term: string;
  tradition: string;
  meaning: string;
}

// A starter slice of docs/content-knowledge-base.md §5; the full glossary is seeded later.
const TERMS: Term[] = [
  { term: 'Prāṇa', tradition: 'Yogic', meaning: 'Vital life-force; breath is its grossest expression.' },
  { term: 'Prāṇāyāma', tradition: 'Yogic', meaning: 'Regulating / extending the breath (and prāṇa).' },
  { term: 'Nāḍī', tradition: 'Yogic', meaning: 'A subtle channel; the chief three are iḍā, piṅgalā, suṣumnā.' },
  { term: 'Chakra', tradition: 'Yogic / Tantra', meaning: '“Wheel” — a lotus-like energy center on the central channel.' },
  { term: 'Kuṇḍalinī', tradition: 'Yogic / Tantra', meaning: 'Dormant “coiled” energy at the base that is said to rise to the crown.' },
  { term: 'Kumbhaka', tradition: 'Yogic', meaning: 'Breath retention (after the inhale or the exhale).' },
  { term: 'Bandha', tradition: 'Hatha Yoga', meaning: 'An energetic “lock” (mūla, uḍḍiyāna, jālandhara) said to seal prāṇa.' },
];

export default function GlossaryModal() {
  const { colors, spacing, radius } = useAppTheme();

  return (
    <Screen>
      <AppText variant="title">Glossary</AppText>
      <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
        {TERMS.map((t) => (
          <View
            key={t.term}
            style={[
              styles.row,
              { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md },
            ]}>
            <View style={styles.head}>
              <AppText variant="heading">{t.term}</AppText>
              <AppText variant="caption" color="lo">
                {t.tradition}
              </AppText>
            </View>
            <AppText variant="body" color="lo" style={{ marginTop: 2 }}>
              {t.meaning}
            </AppText>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { padding: 14, borderWidth: StyleSheet.hairlineWidth },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
});
