import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { AppText } from '@/components/ui/text';
import { useAppTheme } from '@/theme/ThemeProvider';

export default function ReflectScreen() {
  const { colors, spacing, radius } = useAppTheme();

  return (
    <Screen>
      <AppText variant="title">Reflect</AppText>
      <AppText variant="body" color="lo" style={{ marginTop: spacing.xs }}>
        After a session you can note where the breath was felt in the body and how it shifted.
      </AppText>

      <View
        style={[
          styles.empty,
          { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg },
        ]}>
        <Ionicons name="body-outline" size={40} color={colors.textLo} />
        <AppText variant="heading" style={{ marginTop: spacing.md }}>
          No reflections yet
        </AppText>
        <AppText variant="caption" color="lo" style={{ textAlign: 'center', marginTop: spacing.xs }}>
          Complete a practice to capture your first felt-sense body map.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: {
    marginTop: 28,
    padding: 28,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
