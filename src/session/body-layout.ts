/**
 * Front-view body silhouette layout: viewBox, the silhouette shapes, and a normalized hotspot
 * coordinate per body_region code. Regions render only if they exist both in the DB and here, so
 * a pack's region set drives the map. felt-sense color temperature → glow color.
 */
import type { BodyRegionCode } from '@/domain/enums';

export const BODY_VIEWBOX = { w: 200, h: 420 };

export interface Point {
  x: number;
  y: number;
}

/** Hotspot centers on the front-view silhouette (viewBox 200×420). */
export const REGION_POS: Partial<Record<BodyRegionCode, Point>> = {
  crown: { x: 100, y: 14 },
  brow: { x: 100, y: 30 },
  throat: { x: 100, y: 62 },
  chest: { x: 100, y: 92 },
  heart: { x: 100, y: 104 },
  solar_plexus: { x: 100, y: 138 },
  navel: { x: 100, y: 162 },
  lower_belly: { x: 100, y: 190 },
  perineum: { x: 100, y: 216 },
  whole_body: { x: 100, y: 150 },
};

/** Silhouette primitives (drawn in order). */
export const SILHOUETTE = {
  head: { cx: 100, cy: 30, r: 20 },
  torso: 'M80,52 Q100,47 120,52 L113,196 Q100,208 87,196 Z',
  armLeft: 'M84,60 L58,150',
  armRight: 'M116,60 L142,150',
  legLeft: 'M92,200 L84,372',
  legRight: 'M108,200 L116,372',
};

export function tempColor(temp: string | undefined, fallback: string): string {
  switch (temp) {
    case 'warm':
      return '#FF8A5C';
    case 'cool':
      return '#5AA9E6';
    default:
      return fallback;
  }
}
