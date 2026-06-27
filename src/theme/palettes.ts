/**
 * Breathe — concrete palettes and the Yogic energy-body reference data.
 *
 * Dark-first. Three base themes (neutral "Calm Orb", felt-sense thermal, Yogic) fill the
 * ColorRoles shape. The chakra ladder ships the MODERN rainbow palette WITH an honest
 * "modern color system" note, plus a CLASSICAL element-color alternative — never implying
 * the rainbow is ancient. Sources: docs/visual-design-system.md §1.1 and the verified
 * attribution corrections in docs/content-knowledge-base.md §6.2.
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

/** ColorRoles per tradition. The active tradition drives the app theme (v1: Yogic). */
export const TRADITION_THEME: Record<string, ColorRoles> = {
  yogic: YOGIC_THEME,
};

/** Fallback theme for traditions that have not shipped their own palette yet. */
export const DEFAULT_THEME: ColorRoles = YOGIC_THEME;

/** A chakra reference entry. Colors are belief/tradition data, not anatomy. */
export interface ChakraDef {
  slug: string;
  name: string;
  /** Sanskrit (IAST). */
  sanskrit: string;
  ordinal: number;
  /** body_region code. */
  region: string;
  petals: number;
  /** Seed (bīja) syllable; Sahasrara is silent / OM by lineage. */
  bija: string;
  element: string;
  /** MODERN rainbow color (Theosophical/Hills synthesis, ~1977). Label as modern in UI. */
  modernColor: string;
  /** CLASSICAL element-derived color cue (per Woodroffe's "The Serpent Power", 1918). */
  classicalColor: string;
  classicalNote: string;
}

/**
 * The seven principal chakras. petals = 4·6·10·12·16·2·1000. The classical colors
 * deliberately differ from the rainbow (e.g., Manipura is red, not yellow; Vishuddha is
 * smoky/white, not blue) — this is encoded so the UI can render the popular palette and
 * still tell the truth about it.
 */
export const CHAKRAS: ChakraDef[] = [
  {
    slug: 'muladhara',
    name: 'Root',
    sanskrit: 'Mūlādhāra',
    ordinal: 1,
    region: 'perineum',
    petals: 4,
    bija: 'LAM',
    element: 'earth',
    modernColor: '#D7263D',
    classicalColor: '#B71C1C',
    classicalNote: 'Deep red with a yellow earth-square (pṛthvī).',
  },
  {
    slug: 'svadhisthana',
    name: 'Sacral',
    sanskrit: 'Svādhiṣṭhāna',
    ordinal: 2,
    region: 'lower_belly',
    petals: 6,
    bija: 'VAM',
    element: 'water',
    modernColor: '#F46036',
    classicalColor: '#E8EEF2',
    classicalNote: 'Vermilion petals with a white water-crescent (candra).',
  },
  {
    slug: 'manipura',
    name: 'Navel',
    sanskrit: 'Maṇipūra',
    ordinal: 3,
    region: 'navel',
    petals: 10,
    bija: 'RAM',
    element: 'fire',
    modernColor: '#F4D35E',
    classicalColor: '#C0392B',
    classicalNote: 'Rain-cloud/dark-blue petals with an inner RED fire-triangle — classically red, not yellow.',
  },
  {
    slug: 'anahata',
    name: 'Heart',
    sanskrit: 'Anāhata',
    ordinal: 4,
    region: 'heart',
    petals: 12,
    bija: 'YAM',
    element: 'air',
    modernColor: '#3DA35D',
    classicalColor: '#C97B2E',
    classicalNote: 'Vermilion/smoke-grey petals with a hexagram (ṣaṭkoṇa); modern systems use green.',
  },
  {
    slug: 'vishuddha',
    name: 'Throat',
    sanskrit: 'Viśuddha',
    ordinal: 5,
    region: 'throat',
    petals: 16,
    bija: 'HAM',
    element: 'ether',
    modernColor: '#2E86AB',
    classicalColor: '#EDEDED',
    classicalNote: 'Smoky-purple petals with a white moon-disc center — classically smoky/white, not blue.',
  },
  {
    slug: 'ajna',
    name: 'Brow',
    sanskrit: 'Ājñā',
    ordinal: 6,
    region: 'brow',
    petals: 2,
    bija: 'OM',
    element: 'mind',
    modernColor: '#3B3B98',
    classicalColor: '#F2F2F2',
    classicalNote: 'Two white petals with OM; modern systems use indigo.',
  },
  {
    slug: 'sahasrara',
    name: 'Crown',
    sanskrit: 'Sahasrāra',
    ordinal: 7,
    region: 'crown',
    petals: 1000,
    bija: '',
    element: 'consciousness',
    modernColor: '#E6E6FA',
    classicalColor: '#FFFFFF',
    classicalNote: 'A thousand-petalled lotus, luminous white "whiter than the full moon".',
  },
];

/** The three principal nadis (channels). */
export interface NadiDef {
  slug: string;
  name: string;
  side: 'central' | 'left' | 'right';
  polarity: string;
  color: string;
}

export const NADIS: NadiDef[] = [
  { slug: 'sushumna', name: 'Suṣumnā', side: 'central', polarity: 'fire / axis', color: '#C9A227' },
  { slug: 'ida', name: 'Iḍā', side: 'left', polarity: 'lunar / cooling', color: '#9FB8E6' },
  { slug: 'pingala', name: 'Piṅgalā', side: 'right', polarity: 'solar / heating', color: '#E07A5F' },
];
