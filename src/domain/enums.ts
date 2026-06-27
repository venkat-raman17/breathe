/**
 * Breathe — shared domain enums.
 *
 * Plain string-literal unions backed by `as const` arrays so the same list can be
 * reused at runtime (Zod validation, DB checks) and at the type level. Keep these in
 * sync with the data model in docs/app-architecture.md §4.
 */

/** Top-level library goals (goal taxonomy is the primary browse axis). */
export const GOAL_CODES = [
  'calm',
  'focus',
  'sleep',
  'recovery',
  'energy',
  'breath_mechanics',
  'meditative_awareness',
  'traditional_practice',
] as const;
export type GoalCode = (typeof GOAL_CODES)[number];

/** Honesty about how old/authentic a tradition's model is (drives provenance badges). */
export const PROVENANCE = [
  'classical',
  'medieval',
  'modern_synthesis',
  'contested',
  'reconstruction',
] as const;
export type Provenance = (typeof PROVENANCE)[number];

/** Physical-intensity class — gates onboarding order and the safety route. */
export const INTENSITY_CLASSES = ['gentle', 'moderate', 'advanced_caution'] as const;
export type IntensityClass = (typeof INTENSITY_CLASSES)[number];

/** Breath-phase types in a session template. */
export const PHASE_TYPES = ['inhale', 'hold_in', 'exhale', 'hold_out', 'rest', 'free'] as const;
export type PhaseType = (typeof PHASE_TYPES)[number];

export const BREATH_ROUTES = ['nasal', 'mouth', 'either'] as const;
export type BreathRoute = (typeof BREATH_ROUTES)[number];

/** How energy is narrated as moving through the body during a phase (docs §3.3). */
export const ENERGY_MOTIONS = [
  'rise',
  'descend',
  'pool',
  'expand',
  'circulate',
  'settle',
  'ignite',
] as const;
export type EnergyMotion = (typeof ENERGY_MOTIONS)[number];

/** Lets the UI honestly label a center's color as classical vs the modern rainbow. */
export const COLOR_PROVENANCE = ['classical_element', 'modern_rainbow'] as const;
export type ColorProvenance = (typeof COLOR_PROVENANCE)[number];

/** Sacred-geometry primitive drawn at an energy center. */
export const GEOMETRY_MOTIFS = [
  'lotus',
  'triangle_up',
  'triangle_down',
  'crescent',
  'square',
  'hexagram',
  'circle',
  'flame',
  'point',
  'none',
] as const;
export type GeometryMotif = (typeof GEOMETRY_MOTIFS)[number];

export const TRADITION_FAMILIES = [
  'indic',
  'tibetan',
  'chinese',
  'japanese',
  'buddhist',
  'islamic',
  'jewish',
  'western_esoteric',
  'modern',
  'indigenous',
] as const;
export type TraditionFamily = (typeof TRADITION_FAMILIES)[number];

export const CHANNEL_ROLES = [
  'central',
  'left',
  'right',
  'governing',
  'conception',
  'loop',
  'minor',
] as const;
export type ChannelRole = (typeof CHANNEL_ROLES)[number];

/** Asset rights — the content build fails if a bundled asset lacks license + attribution. */
export const RIGHTS_CLASSES = [
  'commissioned',
  'cc0',
  'cc_by',
  'cc_by_nc',
  'public_domain',
  'proprietary',
] as const;
export type RightsClass = (typeof RIGHTS_CLASSES)[number];

export const PACK_KINDS = ['core', 'tradition', 'voice', 'illustration'] as const;
export type PackKind = (typeof PACK_KINDS)[number];

/** Controlled felt-sense vocabulary (powers Felt-Sense mode + reflection tags). */
export const FELT_QUALITIES = [
  'warmth',
  'cool',
  'tingling',
  'pressure',
  'expansion',
  'openness',
  'flow',
  'heaviness',
  'lightness',
  'settling',
  'vibration',
  'pulsation',
  'tightness',
] as const;
export type FeltQuality = (typeof FELT_QUALITIES)[number];

/** Canonical body-silhouette regions shared across traditions + felt-sense maps. */
export const BODY_REGIONS = [
  'crown',
  'brow',
  'throat',
  'heart',
  'solar_plexus',
  'navel',
  'lower_belly',
  'perineum',
  'spine',
  'front_midline',
  'left_channel',
  'right_channel',
  'nostrils',
  'chest',
  'hands',
  'feet',
  'whole_body',
] as const;
export type BodyRegionCode = (typeof BODY_REGIONS)[number];

export const BODY_VIEWS = ['front', 'back', 'both'] as const;
export type BodyView = (typeof BODY_VIEWS)[number];
