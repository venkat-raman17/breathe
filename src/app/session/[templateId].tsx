import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { useAppTheme } from '@/theme/ThemeProvider';

export default function SessionPlayerScreen() {
  const { templateId } = useLocalSearchParams<{ templateId: string }>();
  const { colors, spacing } = useAppTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      {/* Single-tap stop is always available (trauma-aware, exit-friendly). */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Stop and close session"
        onPress={() => router.back()}
        style={styles.close}>
        <Ionicons name="close" size={28} color={colors.textLo} />
      </Pressable>

      <View style={styles.center}>
        <View style={[styles.orb, { backgroundColor: colors.phaseHoldGlow }]} />
        <AppText variant="heading" style={{ marginTop: spacing.xl }}>
          Session player
        </AppText>
        <AppText variant="caption" color="lo" style={{ marginTop: spacing.xs }}>
          The paced breath engine (template: {templateId ?? 'demo'}) lands in Phase 1.
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 56 },
  close: { position: 'absolute', top: 56, right: 20, zIndex: 2, padding: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  orb: { width: 140, height: 140, borderRadius: 70, opacity: 0.85 },
});
