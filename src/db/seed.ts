/**
 * Breathe — content seeding.
 *
 * Loads the build-time `seed.generated.json` into SQLite. Idempotent: keyed by a version string
 * derived from each pack's `slug@version`, recorded in `content_version`. If that version is already
 * present we skip; otherwise we wipe + re-insert the CONTENT tables in one transaction (user tables
 * like practice_session are never touched). Offline — no network.
 */
import type { SQLiteDatabase } from 'expo-sqlite';

import seedData from '@/content/seed.generated.json';
import type { ContentBundle } from '@/domain/content';
import { openDb } from './client';

interface SeedFile {
  bundles: ContentBundle[];
}

const seed = seedData as unknown as SeedFile;

const bool = (v: unknown): number => (v ? 1 : 0);
const orNull = <T,>(v: T | undefined | null): T | null => (v === undefined ? null : v);

/** Content tables in child→parent order, for wiping before a reseed (FKs are ON). */
const WIPE_ORDER = [
  'translation_string',
  'media_asset',
  'contraindication_rule',
  'energy_script',
  'phase',
  'session_template',
  'technique_goal',
  'technique_tradition',
  'technique_alias',
  'technique',
  'felt_sense_vocab',
  'energy_channel',
  'energy_center',
  'visual_theme',
  'body_region',
  'tradition',
  'content_pack',
];

function deriveVersion(bundles: ContentBundle[]): string {
  return bundles
    .map((b) => `${b.pack.slug}@${b.pack.version}`)
    .sort()
    .join(',');
}

export async function seedDatabase(db: SQLiteDatabase): Promise<void> {
  const version = deriveVersion(seed.bundles);
  const existing = await db.getFirstAsync<{ version: string }>(
    'SELECT version FROM content_version WHERE version = ?',
    version,
  );
  if (existing) return;

  await db.withTransactionAsync(async () => {
    for (const table of WIPE_ORDER) {
      await db.execAsync(`DELETE FROM ${table};`);
    }

    for (const b of seed.bundles) {
      const p = b.pack;
      await db.runAsync(
        `INSERT OR REPLACE INTO content_pack (slug, kind, tradition_slug, version, size_bytes, available_locales, license_summary_key, min_app_version)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        p.slug,
        p.kind,
        orNull(p.traditionSlug),
        p.version,
        p.sizeBytes ?? 0,
        JSON.stringify(p.availableLocales ?? ['en']),
        orNull(p.licenseSummaryKey),
        orNull(p.minAppVersion),
      );

      for (const t of b.traditions ?? []) {
        await db.runAsync(
          `INSERT OR REPLACE INTO tradition (slug, display_name_key, family, cosmology_summary_key, lineage_notes_key, provenance, is_modern_synthesis, requires_initiation_note, is_closed_practice, belief_label_key, default_theme_slug)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          t.slug,
          t.displayNameKey,
          t.family,
          t.cosmologySummaryKey,
          orNull(t.lineageNotesKey),
          t.provenance,
          bool(t.isModernSynthesis),
          bool(t.requiresInitiationNote),
          bool(t.isClosedPractice),
          t.beliefLabelKey,
          t.defaultThemeSlug,
        );
      }

      for (const r of b.bodyRegions ?? []) {
        await db.runAsync(
          `INSERT OR REPLACE INTO body_region (code, display_name_key, view, svg_region_id) VALUES (?, ?, ?, ?)`,
          r.code,
          r.displayNameKey,
          r.view,
          orNull(r.svgRegionId),
        );
      }

      for (const v of b.visualThemes ?? []) {
        await db.runAsync(
          `INSERT OR REPLACE INTO visual_theme (slug, tradition_slug, palette_json, gradient_json, motif_set, shader_key, reduce_motion_fallback)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          v.slug,
          orNull(v.traditionSlug),
          JSON.stringify(v.paletteJson ?? {}),
          v.gradientJson ? JSON.stringify(v.gradientJson) : null,
          v.motifSet,
          orNull(v.shaderKey),
          v.reduceMotionFallback,
        );
      }

      for (const c of b.energyCenters ?? []) {
        await db.runAsync(
          `INSERT OR REPLACE INTO energy_center (slug, tradition_slug, display_name_key, ordinal, body_region_code, geometry_motif, petal_count, seed_syllable_key, color_token, color_provenance, element_key, deity_or_figure_key, felt_quality_keys, notes_key)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          c.slug,
          c.traditionSlug,
          c.displayNameKey,
          c.ordinal,
          c.bodyRegionCode,
          c.geometryMotif,
          orNull(c.petalCount),
          orNull(c.seedSyllableKey),
          c.colorToken,
          c.colorProvenance,
          orNull(c.elementKey),
          orNull(c.deityOrFigureKey),
          JSON.stringify(c.feltQualities ?? []),
          orNull(c.notesKey),
        );
      }

      for (const ch of b.energyChannels ?? []) {
        await db.runAsync(
          `INSERT OR REPLACE INTO energy_channel (slug, tradition_slug, display_name_key, role, path_id, color_token, polarity_key, notes_key)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          ch.slug,
          ch.traditionSlug,
          ch.displayNameKey,
          ch.role,
          orNull(ch.pathId),
          ch.colorToken,
          orNull(ch.polarityKey),
          orNull(ch.notesKey),
        );
      }

      for (const f of b.feltSenseVocab ?? []) {
        await db.runAsync(
          `INSERT OR REPLACE INTO felt_sense_vocab (code, display_name_key, valence_default, color_temp, body_region_affinity)
           VALUES (?, ?, ?, ?, ?)`,
          f.code,
          f.displayNameKey,
          f.valenceDefault,
          f.colorTemp,
          JSON.stringify(f.bodyRegionAffinity ?? []),
        );
      }

      for (const tech of b.techniques ?? []) {
        await db.runAsync(
          `INSERT OR REPLACE INTO technique (slug, canonical_name_key, summary_key, primary_tradition_slug, intensity_class, requires_safety_gate, felt_experience_key, safety_notes_key)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          tech.slug,
          tech.canonicalNameKey,
          tech.summaryKey,
          orNull(tech.primaryTraditionSlug),
          tech.intensityClass,
          bool(tech.requiresSafetyGate),
          orNull(tech.feltExperienceKey),
          orNull(tech.safetyNotesKey),
        );
        for (const alias of tech.aliases ?? []) {
          await db.runAsync(
            `INSERT OR REPLACE INTO technique_alias (technique_slug, locale, alias) VALUES (?, ?, ?)`,
            tech.slug,
            'en',
            alias,
          );
        }
        for (const ts of tech.traditionSlugs ?? []) {
          await db.runAsync(
            `INSERT OR REPLACE INTO technique_tradition (technique_slug, tradition_slug, role) VALUES (?, ?, ?)`,
            tech.slug,
            ts,
            ts === tech.primaryTraditionSlug ? 'primary' : 'related',
          );
        }
        for (const g of tech.goals ?? []) {
          await db.runAsync(
            `INSERT OR REPLACE INTO technique_goal (technique_slug, goal_code, strength) VALUES (?, ?, ?)`,
            tech.slug,
            g.goalCode,
            g.strength,
          );
        }
      }

      for (const tpl of b.sessionTemplates ?? []) {
        await db.runAsync(
          `INSERT OR REPLACE INTO session_template (slug, technique_slug, duration_sec, difficulty, posture, phase_json, default_theme_slug, default_energy_script_slug)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          tpl.slug,
          tpl.techniqueSlug,
          tpl.durationSec,
          tpl.difficulty,
          orNull(tpl.posture),
          JSON.stringify(tpl.phases ?? []),
          orNull(tpl.defaultThemeSlug),
          orNull(tpl.defaultEnergyScriptSlug),
        );
      }

      for (const es of b.energyScripts ?? []) {
        await db.runAsync(
          `INSERT OR REPLACE INTO energy_script (slug, tradition_slug, template_slug, events_json, summary_key)
           VALUES (?, ?, ?, ?, ?)`,
          es.slug,
          es.traditionSlug,
          null,
          JSON.stringify(es.events ?? []),
          es.summaryKey,
        );
      }

      for (const cr of b.contraindicationRules ?? []) {
        await db.runAsync(
          `INSERT OR REPLACE INTO contraindication_rule (id, technique_slug, severity, condition_code, message_key)
           VALUES (?, ?, ?, ?, ?)`,
          cr.id,
          orNull(cr.techniqueSlug),
          cr.severity,
          cr.conditionCode,
          cr.messageKey,
        );
      }

      for (const m of b.mediaAssets ?? []) {
        await db.runAsync(
          `INSERT OR REPLACE INTO media_asset (id, kind, locale, uri, bundled, checksum, licence, attribution, rights_class, pack_slug, duration_ms)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          m.id,
          m.kind,
          m.locale,
          m.uri,
          bool(m.bundled),
          orNull(m.checksum),
          m.licence,
          m.attribution,
          m.rightsClass,
          orNull(m.packSlug),
          orNull(m.durationMs),
        );
      }

      for (const tr of b.translations ?? []) {
        await db.runAsync(
          `INSERT OR REPLACE INTO translation_string (key, locale, value, rtl) VALUES (?, ?, ?, ?)`,
          tr.key,
          tr.locale,
          tr.value,
          bool(tr.rtl),
        );
      }
    }

    await db.runAsync(
      `INSERT OR REPLACE INTO content_version (version, created_at, channel, checksum) VALUES (?, ?, ?, ?)`,
      version,
      Date.now(),
      'bundled',
      null,
    );
  });
}

/** Open + migrate + seed. The single entry point the SettingsProvider awaits at boot. */
export async function initData(): Promise<SQLiteDatabase> {
  const db = await openDb();
  await seedDatabase(db);
  return db;
}
