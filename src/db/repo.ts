/**
 * Breathe — typed data-access over the offline SQLite content. All reads go through the shared
 * connection (`openDb()` is idempotent and seeding has already run at boot). Snake_case rows are
 * mapped to camelCase result objects; JSON columns are parsed; 0/1 flags become booleans.
 */
import { openDb } from './client';

// DB-boundary row shape (snake_case, loosely typed by design).
type Row = Record<string, any>;

export interface TraditionInfo {
  slug: string;
  displayNameKey: string;
  family: string;
  cosmologySummaryKey: string;
  lineageNotesKey: string | null;
  provenance: string;
  isModernSynthesis: boolean;
  requiresInitiationNote: boolean;
  isClosedPractice: boolean;
  beliefLabelKey: string;
  defaultThemeSlug: string;
}

export interface ContentPackInfo {
  slug: string;
  kind: string;
  traditionSlug: string | null;
  version: number;
  sizeBytes: number;
  availableLocales: string[];
  licenseSummaryKey: string | null;
  minAppVersion: string | null;
}

export interface EnergyCenterInfo {
  slug: string;
  traditionSlug: string;
  displayNameKey: string;
  ordinal: number;
  bodyRegionCode: string;
  geometryMotif: string;
  petalCount: number | null;
  seedSyllableKey: string | null;
  colorToken: string;
  colorProvenance: string;
  elementKey: string | null;
  deityOrFigureKey: string | null;
  feltQualities: string[];
  notesKey: string | null;
}

export interface EnergyChannelInfo {
  slug: string;
  traditionSlug: string;
  displayNameKey: string;
  role: string;
  pathId: string | null;
  colorToken: string;
  polarityKey: string | null;
  notesKey: string | null;
}

export interface TechniqueInfo {
  slug: string;
  canonicalNameKey: string;
  summaryKey: string;
  primaryTraditionSlug: string | null;
  intensityClass: string;
  requiresSafetyGate: boolean;
  feltExperienceKey: string | null;
  safetyNotesKey: string | null;
}

export interface VisualThemeInfo {
  slug: string;
  traditionSlug: string | null;
  palette: Record<string, string>;
}

export interface BodyRegionInfo {
  code: string;
  displayNameKey: string;
  view: string;
  svgRegionId: string | null;
}

function mapTradition(r: Row): TraditionInfo {
  return {
    slug: r.slug,
    displayNameKey: r.display_name_key,
    family: r.family,
    cosmologySummaryKey: r.cosmology_summary_key,
    lineageNotesKey: r.lineage_notes_key ?? null,
    provenance: r.provenance,
    isModernSynthesis: !!r.is_modern_synthesis,
    requiresInitiationNote: !!r.requires_initiation_note,
    isClosedPractice: !!r.is_closed_practice,
    beliefLabelKey: r.belief_label_key,
    defaultThemeSlug: r.default_theme_slug,
  };
}

function mapPack(r: Row): ContentPackInfo {
  let locales: string[] = ['en'];
  try {
    locales = JSON.parse(r.available_locales ?? '["en"]');
  } catch {
    locales = ['en'];
  }
  return {
    slug: r.slug,
    kind: r.kind,
    traditionSlug: r.tradition_slug ?? null,
    version: r.version,
    sizeBytes: r.size_bytes,
    availableLocales: locales.includes('en') ? locales : ['en', ...locales],
    licenseSummaryKey: r.license_summary_key ?? null,
    minAppVersion: r.min_app_version ?? null,
  };
}

function mapCenter(r: Row): EnergyCenterInfo {
  let felt: string[] = [];
  try {
    felt = JSON.parse(r.felt_quality_keys ?? '[]');
  } catch {
    felt = [];
  }
  return {
    slug: r.slug,
    traditionSlug: r.tradition_slug,
    displayNameKey: r.display_name_key,
    ordinal: r.ordinal,
    bodyRegionCode: r.body_region_code,
    geometryMotif: r.geometry_motif,
    petalCount: r.petal_count ?? null,
    seedSyllableKey: r.seed_syllable_key ?? null,
    colorToken: r.color_token,
    colorProvenance: r.color_provenance,
    elementKey: r.element_key ?? null,
    deityOrFigureKey: r.deity_or_figure_key ?? null,
    feltQualities: felt,
    notesKey: r.notes_key ?? null,
  };
}

function mapChannel(r: Row): EnergyChannelInfo {
  return {
    slug: r.slug,
    traditionSlug: r.tradition_slug,
    displayNameKey: r.display_name_key,
    role: r.role,
    pathId: r.path_id ?? null,
    colorToken: r.color_token,
    polarityKey: r.polarity_key ?? null,
    notesKey: r.notes_key ?? null,
  };
}

function mapTechnique(r: Row): TechniqueInfo {
  return {
    slug: r.slug,
    canonicalNameKey: r.canonical_name_key,
    summaryKey: r.summary_key,
    primaryTraditionSlug: r.primary_tradition_slug ?? null,
    intensityClass: r.intensity_class,
    requiresSafetyGate: !!r.requires_safety_gate,
    feltExperienceKey: r.felt_experience_key ?? null,
    safetyNotesKey: r.safety_notes_key ?? null,
  };
}

export async function getTraditions(): Promise<TraditionInfo[]> {
  const db = await openDb();
  const rows = await db.getAllAsync<Row>('SELECT * FROM tradition ORDER BY slug');
  return rows.map(mapTradition);
}

export async function getTradition(slug: string): Promise<TraditionInfo | null> {
  const db = await openDb();
  const row = await db.getFirstAsync<Row>('SELECT * FROM tradition WHERE slug = ?', slug);
  return row ? mapTradition(row) : null;
}

export async function getContentPacks(): Promise<ContentPackInfo[]> {
  const db = await openDb();
  const rows = await db.getAllAsync<Row>('SELECT * FROM content_pack ORDER BY slug');
  return rows.map(mapPack);
}

export async function getEnergyCenters(traditionSlug: string): Promise<EnergyCenterInfo[]> {
  const db = await openDb();
  const rows = await db.getAllAsync<Row>(
    'SELECT * FROM energy_center WHERE tradition_slug = ? ORDER BY ordinal',
    traditionSlug,
  );
  return rows.map(mapCenter);
}

export async function getEnergyCenter(slug: string): Promise<EnergyCenterInfo | null> {
  const db = await openDb();
  const row = await db.getFirstAsync<Row>('SELECT * FROM energy_center WHERE slug = ?', slug);
  return row ? mapCenter(row) : null;
}

export async function getEnergyChannels(traditionSlug: string): Promise<EnergyChannelInfo[]> {
  const db = await openDb();
  const rows = await db.getAllAsync<Row>(
    'SELECT * FROM energy_channel WHERE tradition_slug = ? ORDER BY role',
    traditionSlug,
  );
  return rows.map(mapChannel);
}

export async function getBodyRegions(): Promise<BodyRegionInfo[]> {
  const db = await openDb();
  const rows = await db.getAllAsync<Row>('SELECT * FROM body_region');
  return rows.map((r) => ({
    code: r.code,
    displayNameKey: r.display_name_key,
    view: r.view,
    svgRegionId: r.svg_region_id ?? null,
  }));
}

export async function getTechniquesForTradition(traditionSlug: string): Promise<TechniqueInfo[]> {
  const db = await openDb();
  const rows = await db.getAllAsync<Row>(
    `SELECT t.* FROM technique t
     JOIN technique_tradition tt ON tt.technique_slug = t.slug
     WHERE tt.tradition_slug = ?
     ORDER BY t.slug`,
    traditionSlug,
  );
  return rows.map(mapTechnique);
}

export async function getTechnique(slug: string): Promise<TechniqueInfo | null> {
  const db = await openDb();
  const row = await db.getFirstAsync<Row>('SELECT * FROM technique WHERE slug = ?', slug);
  return row ? mapTechnique(row) : null;
}

export async function getTechniquesForGoal(goalCode: string): Promise<TechniqueInfo[]> {
  const db = await openDb();
  const rows = await db.getAllAsync<Row>(
    `SELECT t.* FROM technique t
     JOIN technique_goal tg ON tg.technique_slug = t.slug
     WHERE tg.goal_code = ?
     ORDER BY tg.strength DESC, t.slug`,
    goalCode,
  );
  return rows.map(mapTechnique);
}

export async function getVisualThemes(): Promise<VisualThemeInfo[]> {
  const db = await openDb();
  const rows = await db.getAllAsync<Row>('SELECT slug, tradition_slug, palette_json FROM visual_theme');
  return rows.map((r) => {
    let palette: Record<string, string> = {};
    try {
      palette = JSON.parse(r.palette_json ?? '{}');
    } catch {
      palette = {};
    }
    return { slug: r.slug, traditionSlug: r.tradition_slug ?? null, palette };
  });
}

/** All translations for a locale as a flat { key: value } map (for i18next resources). */
export async function getTranslations(locale: string): Promise<Record<string, string>> {
  const db = await openDb();
  const rows = await db.getAllAsync<Row>(
    'SELECT key, value FROM translation_string WHERE locale = ?',
    locale,
  );
  const out: Record<string, string> = {};
  for (const r of rows) out[r.key] = r.value;
  return out;
}

// ----- app_setting key/value store --------------------------------------------------
export async function getAppSetting(key: string): Promise<string | null> {
  const db = await openDb();
  const row = await db.getFirstAsync<Row>('SELECT value FROM app_setting WHERE key = ?', key);
  return row?.value ?? null;
}

export async function setAppSetting(key: string, value: string): Promise<void> {
  const db = await openDb();
  await db.runAsync(
    'INSERT OR REPLACE INTO app_setting (key, value) VALUES (?, ?)',
    key,
    value,
  );
}

export async function getAllAppSettings(): Promise<Record<string, string>> {
  const db = await openDb();
  const rows = await db.getAllAsync<Row>('SELECT key, value FROM app_setting');
  const out: Record<string, string> = {};
  for (const r of rows) out[r.key] = r.value;
  return out;
}

// ----- session templates + logging --------------------------------------------------
export interface SessionTemplateInfo {
  slug: string;
  techniqueSlug: string;
  durationSec: number;
  difficulty: string;
  posture: string | null;
  phases: { seq: number; type: string; seconds: number; bodyRegionCode?: string }[];
  defaultThemeSlug: string | null;
  defaultEnergyScriptSlug: string | null;
}

function mapTemplate(r: Row): SessionTemplateInfo {
  let phases: SessionTemplateInfo['phases'] = [];
  try {
    phases = JSON.parse(r.phase_json ?? '[]');
  } catch {
    phases = [];
  }
  return {
    slug: r.slug,
    techniqueSlug: r.technique_slug,
    durationSec: r.duration_sec,
    difficulty: r.difficulty,
    posture: r.posture ?? null,
    phases,
    defaultThemeSlug: r.default_theme_slug ?? null,
    defaultEnergyScriptSlug: r.default_energy_script_slug ?? null,
  };
}

export async function getSessionTemplate(slug: string): Promise<SessionTemplateInfo | null> {
  const db = await openDb();
  const row = await db.getFirstAsync<Row>('SELECT * FROM session_template WHERE slug = ?', slug);
  return row ? mapTemplate(row) : null;
}

export async function getSessionTemplateForTechnique(
  techniqueSlug: string,
): Promise<SessionTemplateInfo | null> {
  const db = await openDb();
  const row = await db.getFirstAsync<Row>(
    'SELECT * FROM session_template WHERE technique_slug = ? ORDER BY duration_sec LIMIT 1',
    techniqueSlug,
  );
  return row ? mapTemplate(row) : null;
}

export interface EnergyEventInfo {
  atPhaseSeq: number;
  atPhaseFraction?: number;
  motion: string;
  fromRegion?: string;
  toRegion?: string;
  centerSlug?: string;
  channelSlug?: string;
  intensity: number;
  colorToken: string;
  labelKey: string;
}

export interface EnergyScriptInfo {
  slug: string;
  traditionSlug: string;
  summaryKey: string;
  events: EnergyEventInfo[];
}

export async function getEnergyScript(slug: string): Promise<EnergyScriptInfo | null> {
  const db = await openDb();
  const row = await db.getFirstAsync<Row>('SELECT * FROM energy_script WHERE slug = ?', slug);
  if (!row) return null;
  let events: EnergyEventInfo[] = [];
  try {
    events = JSON.parse(row.events_json ?? '[]');
  } catch {
    events = [];
  }
  return {
    slug: row.slug,
    traditionSlug: row.tradition_slug,
    summaryKey: row.summary_key,
    events,
  };
}

export async function createSession(args: {
  templateSlug: string | null;
  localeUsed: string;
  traditionUsed: string;
}): Promise<string> {
  const db = await openDb();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await db.runAsync(
    `INSERT INTO practice_session (id, template_slug, started_at, completion_state, locale_used, tradition_used)
     VALUES (?, ?, ?, ?, ?, ?)`,
    id,
    args.templateSlug,
    Date.now(),
    'in_progress',
    args.localeUsed,
    args.traditionUsed,
  );
  return id;
}

export async function logSessionEvent(
  sessionId: string,
  eventType: string,
  payload?: Record<string, unknown>,
): Promise<void> {
  const db = await openDb();
  await db.runAsync(
    `INSERT INTO session_event (session_id, ts_ms, event_type, payload_json) VALUES (?, ?, ?, ?)`,
    sessionId,
    Date.now(),
    eventType,
    payload ? JSON.stringify(payload) : null,
  );
}

export async function endSession(
  sessionId: string,
  completionState: 'completed' | 'stopped',
): Promise<void> {
  const db = await openDb();
  await db.runAsync(
    'UPDATE practice_session SET ended_at = ?, completion_state = ? WHERE id = ?',
    Date.now(),
    completionState,
    sessionId,
  );
}

// ----- felt-sense vocabulary + reflections ------------------------------------------
export interface FeltVocabInfo {
  code: string;
  displayNameKey: string;
  colorTemp: string;
  valenceDefault: number;
}

export async function getFeltSenseVocab(): Promise<FeltVocabInfo[]> {
  const db = await openDb();
  const rows = await db.getAllAsync<Row>(
    'SELECT code, display_name_key, color_temp, valence_default FROM felt_sense_vocab',
  );
  return rows.map((r) => ({
    code: r.code,
    displayNameKey: r.display_name_key,
    colorTemp: r.color_temp,
    valenceDefault: r.valence_default,
  }));
}

export interface ReflectionEntryInput {
  regionCode: string;
  intensity: number;
  qualityCode?: string;
  valence?: number;
}

export async function saveReflection(
  sessionId: string,
  entries: ReflectionEntryInput[],
  note?: string,
): Promise<void> {
  const db = await openDb();
  await db.withTransactionAsync(async () => {
    for (const e of entries) {
      await db.runAsync(
        `INSERT INTO body_map_entry (session_id, body_region_code, intensity, valence, quality_tags_json)
         VALUES (?, ?, ?, ?, ?)`,
        sessionId,
        e.regionCode,
        e.intensity,
        e.valence ?? 0,
        JSON.stringify(e.qualityCode ? [e.qualityCode] : []),
      );
    }
    if (note && note.trim()) {
      await db.runAsync('UPDATE practice_session SET notes = ? WHERE id = ?', note.trim(), sessionId);
    }
  });
}

export interface ReflectionEntry {
  regionCode: string;
  intensity: number;
  valence: number;
  qualityTags: string[];
}

export interface ReflectionInfo {
  id: string;
  startedAt: number;
  templateSlug: string | null;
  completionState: string;
  notes: string | null;
  entries: ReflectionEntry[];
}

export async function getRecentReflections(limit = 30): Promise<ReflectionInfo[]> {
  const db = await openDb();
  const sessions = await db.getAllAsync<Row>(
    `SELECT id, started_at, template_slug, completion_state, notes
     FROM practice_session ORDER BY started_at DESC LIMIT ?`,
    limit,
  );
  const out: ReflectionInfo[] = [];
  for (const s of sessions) {
    const erows = await db.getAllAsync<Row>(
      'SELECT body_region_code, intensity, valence, quality_tags_json FROM body_map_entry WHERE session_id = ?',
      s.id,
    );
    const entries: ReflectionEntry[] = erows.map((e) => {
      let tags: string[] = [];
      try {
        tags = JSON.parse(e.quality_tags_json ?? '[]');
      } catch {
        tags = [];
      }
      return {
        regionCode: e.body_region_code,
        intensity: e.intensity,
        valence: e.valence,
        qualityTags: tags,
      };
    });
    out.push({
      id: s.id,
      startedAt: s.started_at,
      templateSlug: s.template_slug ?? null,
      completionState: s.completion_state,
      notes: s.notes ?? null,
      entries,
    });
  }
  return out;
}
