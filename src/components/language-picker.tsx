/**
 * A segmented language picker constrained to a pack's available locales. Each language is shown
 * in its own script (endonym), tagged with `lang` for correct screen-reader pronunciation.
 */
import { Pressable, StyleSheet, View } from 'react-native';

import { LOCALE_LABELS } from '@/i18n';
import { useAppTheme } from '@/theme/ThemeProvider';
import { AppText } from './ui/text';

export interface LanguagePickerProps {
  locales: string[];
  active: string;
  onSelect: (locale: string) => void;
}

export function LanguagePicker({ locales, active, onSelect }: LanguagePickerProps) {
  const { colors, radius } = useAppTheme();

  return (
    <View
      accessibilityRole="radiogroup"
      style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.pill }]}>
      {locales.map((loc) => {
        const selected = loc === active;
        return (
          <Pressable
            key={loc}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onSelect(loc)}
            style={[
              styles.seg,
              { borderRadius: radius.pill, backgroundColor: selected ? colors.accent : 'transparent' },
            ]}>
            <AppText variant="label" lang={loc} style={{ color: selected ? colors.bg : colors.textLo }}>
              {LOCALE_LABELS[loc] ?? loc}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    padding: 4,
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: 'flex-start',
  },
  seg: { paddingVertical: 8, paddingHorizontal: 14 },
});
