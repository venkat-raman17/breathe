/**
 * App theme provider. Resolves the active ColorRoles from the active TRADITION (v1: Yogic)
 * and exposes spacing/radius/motion tokens plus the effective reduce-motion flag. There is no
 * "mode" — the experience is always the combined, tradition-forward one; reduce-motion only
 * simplifies the animation, not the symbolism. Renderers consume role names, never literal hexes.
 */
import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { useA11y } from '@/providers/A11yProvider';
import { useTradition } from '@/providers/TraditionProvider';
import { DEFAULT_THEME, TRADITION_THEME } from './palettes';
import { motion, radius, spacing, type ColorRoles } from './tokens';

export interface AppTheme {
  colors: ColorRoles;
  spacing: typeof spacing;
  radius: typeof radius;
  motion: typeof motion;
  /** Effective reduce-motion (OS or app override). */
  reduceMotion: boolean;
}

const AppThemeContext = createContext<AppTheme | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const { traditionSlug } = useTradition();
  const { reduceMotion } = useA11y();

  const value = useMemo<AppTheme>(
    () => ({
      colors: TRADITION_THEME[traditionSlug] ?? DEFAULT_THEME,
      spacing,
      radius,
      motion,
      reduceMotion,
    }),
    [traditionSlug, reduceMotion],
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme(): AppTheme {
  const ctx = useContext(AppThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within an AppThemeProvider');
  return ctx;
}
