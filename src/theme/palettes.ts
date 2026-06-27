/**
 * Breathe — base color palettes.
 *
 * Dark-first. Three base themes (neutral "Calm Orb", felt-sense thermal, Yogic) fill the
 * ColorRoles shape. Per-tradition palettes now live in the DB (`visual_theme.palette_json`) and are
 * resolved at runtime via theme/registry.ts, merged over DEFAULT_THEME — so a new pack ships its
 * palette as data, not code. The Yogic energy-body reference data (chakras/nāḍīs) likewise moved to
 * the seeded `energy_center`/`energy_channel` rows (content/packs/yogic.bundle.json).
 */
import type { ColorRoles } from './tokens';

/** Shared dark surfaces. */
const surfaces = {
  bg: '#0E0B16',
  surface: '#171327',
  surfaceElevated: '#211B38',
  border: '#322A52',
  textHi: '#F5F1FF',
  textLo: '#B7AEE0',
  caution: '#E8B04B',
} as const;

/** Neutral, non-mystical default ("Calm Orb"): teal <-> amber. */
export const NEUTRAL_THEME: ColorRoles = {
  ...surfaces,
  axis: '#5C7C8A',
  energyRise: '#67E8C3',
  energySettle: '#3E6E8E',
  heatCore: '#E8A33D',
  lightRefined: '#FFF7E0',
  phaseInhaleFrom: '#1F3A4D',
  phaseInhaleTo: '#67E8C3',
  phaseExhaleFrom: '#E8A33D',
  phaseExhaleTo: '#3E6E8E',
  phaseHoldGlow: '#9FD8CB',
  phaseRestBase: '#0E0B16',
  accent: '#67E8C3',
};

/** Felt-Sense thermal: warm = activation, cool = settling (no tradition labels). */
export const FELT_SENSE_THEME: ColorRoles = {
  ...surfaces,
  axis: '#6A6A8A',
  energyRise: '#FF8A5C',
  energySettle: '#5AA9E6',
  heatCore: '#FF6B6B',
  lightRefined: '#FFE8C2',
  phaseInhaleFrom: '#3A2E5C',
  phaseInhaleTo: '#FF8A5C',
  phaseExhaleFrom: '#FF6B6B',
  phaseExhaleTo: '#5AA9E6',
  phaseHoldGlow: '#FFC2A1',
  phaseRestBase: '#0E0B16',
  accent: '#FF8A5C',
};

/** Yogic / Tantric: violet-gold axis with chakra-spectrum accents. */
export const YOGIC_THEME: ColorRoles = {
  ...surfaces,
  axis: '#C9A227',
  energyRise: '#E6B3FF',
  energySettle: '#3B3B98',
  heatCore: '#F4D35E',
  lightRefined: '#FFFFFF',
  phaseInhaleFrom: '#2E1A4D',
  phaseInhaleTo: '#E6B3FF',
  phaseExhaleFrom: '#F4D35E',
  phaseExhaleTo: '#3B3B98',
  phaseHoldGlow: '#E6E6FA',
  phaseRestBase: '#0E0B16',
  accent: '#C9A227',
};

/** Fallback theme — also the base every tradition palette merges over (see theme/registry.ts). */
export const DEFAULT_THEME: ColorRoles = YOGIC_THEME;
