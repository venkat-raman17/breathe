/**
 * Breathe — SQLite schema (offline-first).
 *
 * Migrations are an ordered list; each is applied once and tracked via PRAGMA user_version.
 * The model extends the prior report's base tables with the tradition / energy-body / theming
 * tables from docs/app-architecture.md §4. Closed-practice traditions must never own a runnable
 * session_template — enforced at content-build time (scripts/build-content.ts).
 */

export interface Migration {
  version: number;
  statements: string[];
}

const v1: string[] = [
  // ----- Traditions & energy body -------------------------------------------------
  `CREATE TABLE IF NOT EXISTS tradition (
    slug TEXT PRIMARY KEY,
    display_name_key TEXT NOT NULL,
    family TEXT NOT NULL,
    cosmology_summary_key TEXT NOT NULL,
    lineage_notes_key TEXT,
    provenance TEXT NOT NULL,
    is_modern_synthesis INTEGER NOT NULL DEFAULT 0,
    requires_initiation_note INTEGER NOT NULL DEFAULT 0,
    is_closed_practice INTEGER NOT NULL DEFAULT 0,
    belief_label_key TEXT NOT NULL,
    default_theme_slug TEXT NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS energy_center (
    slug TEXT PRIMARY KEY,
    tradition_slug TEXT NOT NULL REFERENCES tradition(slug) ON DELETE CASCADE,
    display_name_key TEXT NOT NULL,
    ordinal INTEGER NOT NULL,
    body_region_code TEXT NOT NULL,
    geometry_motif TEXT NOT NULL,
    petal_count INTEGER,
    seed_syllable_key TEXT,
    color_token TEXT NOT NULL,
    color_provenance TEXT NOT NULL,
    element_key TEXT,
    deity_or_figure_key TEXT,
    felt_quality_keys TEXT NOT NULL DEFAULT '[]',
    notes_key TEXT
  );`,
  `CREATE INDEX IF NOT EXISTS idx_energy_center_tradition ON energy_center(tradition_slug);`,

  `CREATE TABLE IF NOT EXISTS energy_channel (
    slug TEXT PRIMARY KEY,
    tradition_slug TEXT NOT NULL REFERENCES tradition(slug) ON DELETE CASCADE,
    display_name_key TEXT NOT NULL,
    role TEXT NOT NULL,
    path_id TEXT,
    color_token TEXT NOT NULL,
    polarity_key TEXT,
    notes_key TEXT
  );`,
  `CREATE INDEX IF NOT EXISTS idx_energy_channel_tradition ON energy_channel(tradition_slug);`,

  `CREATE TABLE IF NOT EXISTS body_region (
    code TEXT PRIMARY KEY,
    display_name_key TEXT NOT NULL,
    view TEXT NOT NULL,
    svg_region_id TEXT
  );`,

  `CREATE TABLE IF NOT EXISTS body_path (
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL,
    path_data TEXT NOT NULL,
    view TEXT NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS visual_theme (
    slug TEXT PRIMARY KEY,
    tradition_slug TEXT REFERENCES tradition(slug) ON DELETE CASCADE,
    palette_json TEXT NOT NULL,
    gradient_json TEXT,
    motif_set TEXT NOT NULL,
    shader_key TEXT,
    reduce_motion_fallback TEXT NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS felt_sense_vocab (
    code TEXT PRIMARY KEY,
    display_name_key TEXT NOT NULL,
    valence_default INTEGER NOT NULL DEFAULT 0,
    color_temp TEXT NOT NULL DEFAULT 'neutral',
    body_region_affinity TEXT NOT NULL DEFAULT '[]'
  );`,

  // ----- Techniques & sessions ----------------------------------------------------
  `CREATE TABLE IF NOT EXISTS technique (
    slug TEXT PRIMARY KEY,
    canonical_name_key TEXT NOT NULL,
    summary_key TEXT NOT NULL,
    primary_tradition_slug TEXT REFERENCES tradition(slug) ON DELETE SET NULL,
    intensity_class TEXT NOT NULL DEFAULT 'gentle',
    requires_safety_gate INTEGER NOT NULL DEFAULT 0,
    felt_experience_key TEXT,
    safety_notes_key TEXT
  );`,

  `CREATE TABLE IF NOT EXISTS technique_alias (
    technique_slug TEXT NOT NULL REFERENCES technique(slug) ON DELETE CASCADE,
    locale TEXT NOT NULL DEFAULT 'en',
    alias TEXT NOT NULL,
    PRIMARY KEY (technique_slug, locale, alias)
  );`,

  `CREATE TABLE IF NOT EXISTS technique_tradition (
    technique_slug TEXT NOT NULL REFERENCES technique(slug) ON DELETE CASCADE,
    tradition_slug TEXT NOT NULL REFERENCES tradition(slug) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'primary',
    PRIMARY KEY (technique_slug, tradition_slug)
  );`,

  `CREATE TABLE IF NOT EXISTS technique_goal (
    technique_slug TEXT NOT NULL REFERENCES technique(slug) ON DELETE CASCADE,
    goal_code TEXT NOT NULL,
    strength REAL NOT NULL DEFAULT 1,
    PRIMARY KEY (technique_slug, goal_code)
  );`,

  `CREATE TABLE IF NOT EXISTS contraindication_rule (
    id TEXT PRIMARY KEY,
    technique_slug TEXT REFERENCES technique(slug) ON DELETE CASCADE,
    severity TEXT NOT NULL,
    condition_code TEXT NOT NULL,
    message_key TEXT NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS session_template (
    slug TEXT PRIMARY KEY,
    technique_slug TEXT NOT NULL REFERENCES technique(slug) ON DELETE CASCADE,
    duration_sec INTEGER NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'gentle',
    posture TEXT,
    phase_json TEXT NOT NULL,
    default_theme_slug TEXT,
    default_energy_script_slug TEXT
  );`,

  `CREATE TABLE IF NOT EXISTS phase (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_slug TEXT NOT NULL REFERENCES session_template(slug) ON DELETE CASCADE,
    seq INTEGER NOT NULL,
    type TEXT NOT NULL,
    seconds REAL NOT NULL,
    cue_style TEXT,
    body_region_code TEXT,
    breath_route TEXT NOT NULL DEFAULT 'nasal',
    cue_modality_mask INTEGER NOT NULL DEFAULT 15
  );`,
  `CREATE INDEX IF NOT EXISTS idx_phase_template ON phase(template_slug, seq);`,

  `CREATE TABLE IF NOT EXISTS energy_script (
    slug TEXT PRIMARY KEY,
    tradition_slug TEXT NOT NULL REFERENCES tradition(slug) ON DELETE CASCADE,
    template_slug TEXT REFERENCES session_template(slug) ON DELETE CASCADE,
    events_json TEXT NOT NULL,
    summary_key TEXT NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS media_asset (
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL,
    locale TEXT NOT NULL DEFAULT 'en',
    uri TEXT NOT NULL,
    bundled INTEGER NOT NULL DEFAULT 1,
    checksum TEXT,
    licence TEXT NOT NULL,
    attribution TEXT NOT NULL,
    rights_class TEXT NOT NULL,
    pack_slug TEXT,
    duration_ms INTEGER
  );`,

  // ----- i18n, profile, logs ------------------------------------------------------
  `CREATE TABLE IF NOT EXISTS translation_string (
    key TEXT NOT NULL,
    locale TEXT NOT NULL,
    value TEXT NOT NULL,
    rtl INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (key, locale)
  );`,

  `CREATE TABLE IF NOT EXISTS user_profile (
    id TEXT PRIMARY KEY,
    experience_level TEXT NOT NULL DEFAULT 'beginner',
    goals_json TEXT NOT NULL DEFAULT '[]',
    safety_flags_json TEXT NOT NULL DEFAULT '{}',
    active_tradition TEXT NOT NULL DEFAULT 'yogic',
    advanced_unlocked INTEGER NOT NULL DEFAULT 0
  );`,

  `CREATE TABLE IF NOT EXISTS accessibility_pref (
    user_id TEXT PRIMARY KEY REFERENCES user_profile(id) ON DELETE CASCADE,
    reduce_motion_override TEXT,
    screen_reader_mode INTEGER NOT NULL DEFAULT 0,
    caption_default INTEGER NOT NULL DEFAULT 1,
    haptics_default INTEGER NOT NULL DEFAULT 1,
    font_scale REAL NOT NULL DEFAULT 1,
    contrast_theme TEXT NOT NULL DEFAULT 'default'
  );`,

  `CREATE TABLE IF NOT EXISTS practice_session (
    id TEXT PRIMARY KEY,
    template_slug TEXT REFERENCES session_template(slug) ON DELETE SET NULL,
    started_at INTEGER NOT NULL,
    ended_at INTEGER,
    completion_state TEXT NOT NULL DEFAULT 'in_progress',
    notes TEXT,
    locale_used TEXT,
    tradition_used TEXT
  );`,

  `CREATE TABLE IF NOT EXISTS session_event (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL REFERENCES practice_session(id) ON DELETE CASCADE,
    ts_ms INTEGER NOT NULL,
    event_type TEXT NOT NULL,
    payload_json TEXT
  );`,
  `CREATE INDEX IF NOT EXISTS idx_session_event_session ON session_event(session_id, ts_ms);`,

  `CREATE TABLE IF NOT EXISTS body_map_entry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL REFERENCES practice_session(id) ON DELETE CASCADE,
    body_region_code TEXT NOT NULL,
    intensity REAL NOT NULL DEFAULT 0,
    valence INTEGER NOT NULL DEFAULT 0,
    quality_tags_json TEXT NOT NULL DEFAULT '[]'
  );`,

  `CREATE TABLE IF NOT EXISTS content_version (
    version TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,
    channel TEXT,
    checksum TEXT
  );`,
];

export const MIGRATIONS: Migration[] = [{ version: 1, statements: v1 }];

/** Highest migration version this build knows about. */
export const SCHEMA_VERSION = MIGRATIONS[MIGRATIONS.length - 1].version;
