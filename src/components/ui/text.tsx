/**
 * Themed typography. Honors OS font scaling (allowFontScaling) and pulls colors from the
 * active theme so text re-tints with the tradition skin.
 */
import { Text as RNText, StyleSheet, type TextProps } from 'react-native';

import { useAppTheme } from '@/theme/ThemeProvider';

export type TextVariant = 'display' | 'title' | 'heading' | 'body' | 'caption' | 'label';
export type TextColor = 'hi' | 'lo' | 'accent';

const VARIANTS = StyleSheet.create({
  display: { fontSize: 34, lineHeight: 40, fontWeight: '700' },
  title: { fontSize: 26, lineHeight: 32, fontWeight: '700' },
  heading: { fontSize: 19, lineHeight: 25, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 23, fontWeight: '400' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 18, fontWeight: '600' },
});

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: TextColor;
  /** BCP-47 tag (e.g. 'sa', 'ta', 'hi') so screen readers pronounce script fragments correctly. */
  lang?: string;
}

export function AppText({ variant = 'body', color = 'hi', lang, style, ...rest }: AppTextProps) {
  const { colors } = useAppTheme();
  const tint = color === 'lo' ? colors.textLo : color === 'accent' ? colors.accent : colors.textHi;
  return (
    <RNText
      allowFontScaling
      accessibilityLanguage={lang}
      {...rest}
      style={[VARIANTS[variant], { color: tint }, style]}
    />
  );
}
