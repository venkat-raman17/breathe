/**
 * Breathe — runtime theme registry.
 *
 * Visual themes are DATA: `visual_theme.palette_json` rows are loaded into this module-level map
 * at boot (before any screen renders), so a new tradition pack ships its palette without code.
 * `resolveTheme` merges a (partial) palette over the code `DEFAULT_THEME`, so packs only override
 * what differs and all 18 ColorRoles are always filled. Resolution stays synchronous for the UI.
 */
import { getVisualThemes } from '@/db/repo';
import { DEFAULT_THEME } from './palettes';
import type { ColorRoles } from './tokens';

const registry = new Map<string, Record<string, string>>();

/** Populate the registry from the DB. Idempotent (clears + reloads). Call once at boot. */
export async function loadThemeRegistry(): Promise<void> {
  const themes = await getVisualThemes();
  registry.clear();
  for (const t of themes) registry.set(t.slug, t.palette);
}

export function resolveTheme(slug: string | null | undefined): ColorRoles {
  if (!slug) return DEFAULT_THEME;
  const partial = registry.get(slug);
  if (!partial) return DEFAULT_THEME;
  return { ...DEFAULT_THEME, ...partial } as ColorRoles;
}
