/**
 * App theme provider. Resolves ColorRoles from the active tradition's theme slug via the DB-backed
 * theme registry (data-driven — new packs ship a palette, not code). Reduce-motion only simplifies
 * animation. Renderers consume role names, never literal hexes.
 */
import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { useA11y } from '@/providers/A11yProvider';
import { useSettings } from '@/providers/SettingsProvider';
import { resolveTheme } from './registry';
import { motion, radius, spacing, type ColorRoles } from './tokens';

export interface AppTheme {
  colors: ColorRoles;
  spacing: typeof spacing;
  radius: typeof radius;
  motion: typeof motion;
  reduceMotion: boolean;
}

const AppThemeContext = createContext<AppTheme | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const { activeThemeSlug } = useSettings();
  const { reduceMotion } = useA11y();

  const value = useMemo<AppTheme>(
    () => ({ colors: resolveTheme(activeThemeSlug), spacing, radius, motion, reduceMotion }),
    [activeThemeSlug, reduceMotion],
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme(): AppTheme {
  const ctx = useContext(AppThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within an AppThemeProvider');
  return ctx;
}
