import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { AppText } from '@/components/ui/text';
import { useAppTheme } from '@/theme/ThemeProvider';

export default function DisclaimerModal() {
  const { colors, spacing, radius } = useAppTheme();

  return (
    <Screen>
      <AppText variant="title">About Breathe</AppText>

      <AppText variant="heading" style={{ marginTop: spacing.lg }}>
        Not medical advice
      </AppText>
      <AppText variant="body" color="lo" style={{ marginTop: spacing.xs }}>
        Breathe is for well-being, education, and contemplative practice. It is not a medical device
        and does not diagnose, treat, cure, or prevent any condition. If you have a health concern,
        please consult a qualified professional.
      </AppText>

      <AppText variant="heading" style={{ marginTop: spacing.lg }}>
        Belief-based content
      </AppText>
      <AppText variant="body" color="lo" style={{ marginTop: spacing.xs }}>
        Practices are presented as living traditions and felt experience — prāṇa, qi, the chakras and
        other energy models are the way a tradition describes inner experience, not measured anatomy.
        Where a popular idea is actually a modern synthesis (such as the rainbow-chakra colors), we say
        so.
      </AppText>

      <View
        style={[
          styles.safety,
          { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md },
        ]}>
        <AppText variant="label" style={{ color: colors.caution }}>
          Safety
        </AppText>
        <AppText variant="caption" color="lo" style={{ marginTop: spacing.xs }}>
          Never do intense or breath-holding practices in or near water, or while driving. Practice
          seated or lying down, and stop if you feel faint or unwell.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safety: { marginTop: 24, padding: 14, borderWidth: StyleSheet.hairlineWidth },
});
