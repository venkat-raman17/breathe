/**
 * Goal-taxonomy metadata. Goals are the PRIMARY browse axis in Explore; technique
 * family is secondary. Icon names are Ionicons (via @expo/vector-icons).
 * Mapping of practices -> goals lives in content (technique_goal); see
 * docs/content-knowledge-base.md §4.
 */
import type { GoalCode } from './enums';

export interface GoalMeta {
  label: string;
  tagline: string;
  /** Ionicons glyph name. */
  icon: string;
}

export const GOAL_META: Record<GoalCode, GoalMeta> = {
  calm: { label: 'Calm', tagline: 'Settle the nervous system', icon: 'leaf-outline' },
  focus: { label: 'Focus', tagline: 'Steady, alert attention', icon: 'eye-outline' },
  sleep: { label: 'Sleep', tagline: 'Wind down toward rest', icon: 'moon-outline' },
  recovery: { label: 'Recovery', tagline: 'Deep rest and release', icon: 'pulse-outline' },
  energy: { label: 'Energy', tagline: 'Activate and enliven', icon: 'flash-outline' },
  breath_mechanics: {
    label: 'Breath mechanics',
    tagline: 'Learn the craft of breathing',
    icon: 'options-outline',
  },
  meditative_awareness: {
    label: 'Meditative awareness',
    tagline: 'Rest in open presence',
    icon: 'infinite-outline',
  },
  traditional_practice: {
    label: 'Traditional practice',
    tagline: 'Practices within their lineage',
    icon: 'flower-outline',
  },
};

/** Display order on the home/explore grid. */
export const GOAL_ORDER: GoalCode[] = [
  'calm',
  'sleep',
  'focus',
  'energy',
  'recovery',
  'breath_mechanics',
  'meditative_awareness',
  'traditional_practice',
];
