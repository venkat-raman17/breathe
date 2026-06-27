/**
 * Breathe — content build & validation.
 *
 * Reads authored content bundles from `content/packs/*.bundle.json`, validates each against
 * the Zod schemas (the single source of truth in src/domain/content.ts), enforces ethics/rights
 * rules, and emits a normalized SQLite seed at `src/content/seed.generated.json`.
 *
 * The build FAILS (exit 1) on any of:
 *   - schema violations (including missing media license/attribution);
 *   - a closed-practice tradition owning a runnable session_template (docs §5.3, §6.3);
 *   - a CC-BY-NC asset when BREATHE_COMMERCIAL=1;
 *   - dangling references (unknown tradition/technique/template slugs).
 *
 * Run: `npm run build:content`  (uses tsx). No content yet -> exits 0 with a note.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ContentBundleSchema, type ContentBundle } from '../src/domain/content';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const packsDir = join(root, 'content', 'packs');
const outDir = join(root, 'src', 'content');
const outFile = join(outDir, 'seed.generated.json');

const commercial = process.env.BREATHE_COMMERCIAL === '1';
const errors: string[] = [];

function fail(msg: string) {
  errors.push(msg);
}

function validateReferences(b: ContentBundle, label: string) {
  const traditions = new Set(b.traditions.map((t) => t.slug));
  const techniques = new Map(b.techniques.map((t) => [t.slug, t]));
  const closed = new Set(b.traditions.filter((t) => t.isClosedPractice).map((t) => t.slug));

  for (const c of b.energyCenters) {
    if (!traditions.has(c.traditionSlug))
      fail(`[${label}] energy_center "${c.slug}" references unknown tradition "${c.traditionSlug}"`);
  }
  for (const ch of b.energyChannels) {
    if (!traditions.has(ch.traditionSlug))
      fail(`[${label}] energy_channel "${ch.slug}" references unknown tradition "${ch.traditionSlug}"`);
  }
  for (const t of b.techniques) {
    if (t.primaryTraditionSlug && !traditions.has(t.primaryTraditionSlug))
      fail(`[${label}] technique "${t.slug}" references unknown primary tradition "${t.primaryTraditionSlug}"`);
  }

  // Closed-practice guard: a closed tradition must never own a runnable session_template.
  for (const tpl of b.sessionTemplates) {
    if (tpl.phases.length === 0) continue;
    const tech = techniques.get(tpl.techniqueSlug);
    if (!tech) {
      fail(`[${label}] session_template "${tpl.slug}" references unknown technique "${tpl.techniqueSlug}"`);
      continue;
    }
    const trads = [...new Set([tech.primaryTraditionSlug, ...tech.traditionSlugs].filter(Boolean))] as string[];
    for (const tr of trads) {
      if (closed.has(tr))
        fail(
          `[${label}] closed-practice tradition "${tr}" must not own a runnable session_template ("${tpl.slug}"). Present it descriptively, not as a how-to.`,
        );
    }
  }

  // Rights gate (license/attribution enforced by schema; commercial flag blocks CC-BY-NC).
  for (const a of b.mediaAssets) {
    if (commercial && a.rightsClass === 'cc_by_nc')
      fail(`[${label}] media_asset "${a.id}" is CC-BY-NC but BREATHE_COMMERCIAL=1 — not licensable for commercial use.`);
  }
}

function main() {
  if (!existsSync(packsDir)) {
    console.log(`[build-content] No content directory yet (${packsDir}). Nothing to build.`);
    return;
  }

  const files = readdirSync(packsDir).filter((f) => f.endsWith('.bundle.json'));
  if (files.length === 0) {
    console.log('[build-content] No *.bundle.json files found. Nothing to build.');
    return;
  }

  const bundles: ContentBundle[] = [];
  for (const file of files) {
    const raw = readFileSync(join(packsDir, file), 'utf8');
    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch (e) {
      fail(`[${file}] invalid JSON: ${(e as Error).message}`);
      continue;
    }
    const result = ContentBundleSchema.safeParse(json);
    if (!result.success) {
      for (const issue of result.error.issues) {
        fail(`[${file}] ${issue.path.join('.') || '(root)'}: ${issue.message}`);
      }
      continue;
    }
    // Normalize: English is available in every pack.
    result.data.pack.availableLocales = [...new Set(['en', ...result.data.pack.availableLocales])];
    validateReferences(result.data, file);
    bundles.push(result.data);
  }

  if (errors.length > 0) {
    console.error(`\n[build-content] FAILED with ${errors.length} problem(s):`);
    for (const e of errors) console.error('  • ' + e);
    process.exit(1);
  }

  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const counts = bundles.reduce(
    (acc, b) => {
      acc.traditions += b.traditions.length;
      acc.techniques += b.techniques.length;
      acc.sessionTemplates += b.sessionTemplates.length;
      acc.energyCenters += b.energyCenters.length;
      acc.mediaAssets += b.mediaAssets.length;
      return acc;
    },
    { traditions: 0, techniques: 0, sessionTemplates: 0, energyCenters: 0, mediaAssets: 0 },
  );

  const seed = {
    generatedBy: 'scripts/build-content.ts',
    packCount: bundles.length,
    counts,
    bundles,
  };
  writeFileSync(outFile, JSON.stringify(seed, null, 2) + '\n', 'utf8');
  console.log(
    `[build-content] OK — ${bundles.length} pack(s): ${counts.traditions} traditions, ` +
      `${counts.techniques} techniques, ${counts.sessionTemplates} templates, ` +
      `${counts.energyCenters} centers, ${counts.mediaAssets} assets -> ${outFile}`,
  );
}

main();
