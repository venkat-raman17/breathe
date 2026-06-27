/**
 * Resolve a runnable breath program from a technique- or template-slug. Loads a session_template
 * (by template slug, then by technique) and falls back to a gentle default if none exists, so any
 * technique's "Start practice" works.
 */
import type { PhaseType } from '@/domain/enums';
import { getSessionTemplate, getSessionTemplateForTechnique } from '@/db/repo';

export interface ProgramPhase {
  seq: number;
  type: PhaseType;
  seconds: number;
  bodyRegionCode?: string;
}

export interface SessionProgram {
  templateSlug: string | null;
  techniqueSlug: string | null;
  durationSec: number;
  phases: ProgramPhase[];
}

/** Gentle ~6 bpm fallback (4s in / 6s out) when a technique has no authored template. */
const DEFAULT_PHASES: ProgramPhase[] = [
  { seq: 0, type: 'inhale', seconds: 4 },
  { seq: 1, type: 'exhale', seconds: 6 },
];

export async function resolveProgram(slug: string): Promise<SessionProgram> {
  const tpl = (await getSessionTemplate(slug)) ?? (await getSessionTemplateForTechnique(slug));
  if (tpl && tpl.phases.length > 0) {
    return {
      templateSlug: tpl.slug,
      techniqueSlug: tpl.techniqueSlug,
      durationSec: tpl.durationSec,
      phases: tpl.phases.map((p) => ({
        seq: p.seq,
        type: p.type as PhaseType,
        seconds: p.seconds,
        bodyRegionCode: p.bodyRegionCode,
      })),
    };
  }
  return { templateSlug: null, techniqueSlug: slug, durationSec: 180, phases: DEFAULT_PHASES };
}
