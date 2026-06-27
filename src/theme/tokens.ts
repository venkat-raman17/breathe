/**
 * Breathe — design tokens (theme-agnostic).
 *
 * Motion, the four-phase breath grammar, spacing, and the SEMANTIC color-role shape that
 * every per-tradition palette must fill. Concrete colors live in palettes.ts. Derived from
 * docs/visual-design-system.md §0.3–§0.4 and §3.1.
 */

/** Cubic-bezier control points (x1, y1, x2, y2). */
export const easing = {
  /** Symmetric, organic — the breath itself. */
  breath: [0.37, 0, 0.63, 1] as const,
  /** Deceleration — exhale and rest. */
  settle: [0.22, 1, 0.36, 1] as const,
} as const;

export const motion = {
  easing,
  fpsTarget: 60,
  /** Default particle ceiling; auto-scaled down on low-end devices. */
  particleMaxCount: 120,
  /** 0..1 multiplier on animated displacement. */
  amplitudeScale: 1,
  /** Subtle "breathing at rest" pulse during holds. */
  holdPulseHz: 0.5,
  /** Reduce-motion render branch (see §7.1): opacity/crossfade only. */
  reduceMotion: {
    particleMaxCount: 0,
    amplitudeScale: 0.12,
    maxBrightnessBreathHz: 0.5,
  },
  /** Flash safety (§4.7): never oscillate in the 3–60 Hz seizure band. */
  flashSafety: { maxVisibleOscillationHz: 1.5 },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = { sm: 8, md: 14, lg: 22, xl: 28, pill: 999 } as const;

/** Honor OS font scaling but clamp so timed cues stay legible without breaking layout. */
export const fontScaleClamp = { min: 0.85, max: 1.6 } as const;

/**
 * The four-phase visual contract (§3.1). Each phase carries >= 2 redundant encodings;
 * color never carries a phase change alone.
 */
export const PHASE_GRAMMAR = {
  inhale: { scaleFrom: 0.45, scaleTo: 1.0, brighten: 1, captionKey: 'phase.inhale' },
  hold_in: { scaleFrom: 1.0, scaleTo: 1.0, brighten: 1, captionKey: 'phase.hold' },
  exhale: { scaleFrom: 1.0, scaleTo: 0.45, brighten: -1, captionKey: 'phase.exhale' },
  hold_out: { scaleFrom: 0.45, scaleTo: 0.45, brighten: -1, captionKey: 'phase.rest' },
  rest: { scaleFrom: 0.45, scaleTo: 0.45, brighten: -1, captionKey: 'phase.rest' },
  free: { scaleFrom: 0.6, scaleTo: 0.6, brighten: 0, captionKey: 'phase.free' },
} as const;

/**
 * Semantic color roles. Every theme/skin (neutral, felt-sense, per-tradition) provides a
 * full ColorRoles object; renderers consume role names, never literal hexes.
 */
export interface ColorRoles {
  /** Deep, low-chroma background. */
  bg: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  textHi: string;
  textLo: string;
  /** Central axis / channel (sushumna, Du Mai, central channel). */
  axis: string;
  /** Ascending accent. */
  energyRise: string;
  /** Grounding/settling accent. */
  energySettle: string;
  /** Belly / navel warmth. */
  heatCore: string;
  /** Crown / transcendent white-gold. */
  lightRefined: string;
  phaseInhaleFrom: string;
  phaseInhaleTo: string;
  phaseExhaleFrom: string;
  phaseExhaleTo: string;
  phaseHoldGlow: string;
  phaseRestBase: string;
  accent: string;
  /** Safety/danger color, kept visually separate from belief content. */
  caution: string;
}
