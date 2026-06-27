/**
 * Breathe — authored-content schemas (Zod v4) + inferred types.
 *
 * This is the single source of truth for the shape of authored content. The content-build
 * script (scripts/build-content.ts) validates a ContentBundle against these before emitting
 * the SQLite seed, and the build FAILS on: missing license/attribution, or a closed-practice
 * tradition that owns a runnable session template (see docs/app-architecture.md §5.3).
 */
import { z } from 'zod';
import {
  BODY_REGIONS,
  BODY_VIEWS,
  BREATH_ROUTES,
  CHANNEL_ROLES,
  COLOR_PROVENANCE,
  ENERGY_MOTIONS,
  FELT_QUALITIES,
  GEOMETRY_MOTIFS,
  GOAL_CODES,
  INTENSITY_CLASSES,
  PACK_KINDS,
  PHASE_TYPES,
  PROVENANCE,
  RIGHTS_CLASSES,
  TRADITION_FAMILIES,
} from './enums';

const Slug = z.string().regex(/^[a-z0-9_]+$/, 'slug must be lower_snake_case');
/** An i18n key resolved against translation_string / locale bundles. */
const Key = z.string().min(1);
const ColorToken = z.string().min(1);

export const EnergyEventSchema = z.strictObject({
  atPhaseSeq: z.number().int().nonnegative(),
  atPhaseFraction: z.number().min(0).max(1).optional(),
  motion: z.enum(ENERGY_MOTIONS),
  fromRegion: z.enum(BODY_REGIONS).optional(),
  toRegion: z.enum(BODY_REGIONS).optional(),
  centerSlug: Slug.optional(),
  channelSlug: Slug.optional(),
  intensity: z.number().min(0).max(1),
  colorToken: ColorToken,
  labelKey: Key,
});

export const EnergyCenterSchema = z.strictObject({
  slug: Slug,
  traditionSlug: Slug,
  displayNameKey: Key,
  ordinal: z.number().int(),
  bodyRegionCode: z.enum(BODY_REGIONS),
  geometryMotif: z.enum(GEOMETRY_MOTIFS),
  petalCount: z.number().int().positive().optional(),
  seedSyllableKey: Key.optional(),
  colorToken: ColorToken,
  colorProvenance: z.enum(COLOR_PROVENANCE),
  elementKey: Key.optional(),
  deityOrFigureKey: Key.optional(),
  feltQualities: z.array(z.enum(FELT_QUALITIES)).default([]),
  notesKey: Key.optional(),
});

export const EnergyChannelSchema = z.strictObject({
  slug: Slug,
  traditionSlug: Slug,
  displayNameKey: Key,
  role: z.enum(CHANNEL_ROLES),
  pathId: Slug.optional(),
  colorToken: ColorToken,
  polarityKey: Key.optional(),
  notesKey: Key.optional(),
});

export const VisualThemeSchema = z.strictObject({
  slug: Slug,
  traditionSlug: Slug.nullable().default(null),
  paletteJson: z.record(z.string(), z.string()),
  gradientJson: z.record(z.string(), z.array(z.string())).optional(),
  motifSet: z.string().min(1),
  shaderKey: z.string().optional(),
  reduceMotionFallback: z.string().min(1),
});

export const TraditionSchema = z.strictObject({
  slug: Slug,
  displayNameKey: Key,
  family: z.enum(TRADITION_FAMILIES),
  cosmologySummaryKey: Key,
  lineageNotesKey: Key.optional(),
  provenance: z.enum(PROVENANCE),
  isModernSynthesis: z.boolean().default(false),
  requiresInitiationNote: z.boolean().default(false),
  isClosedPractice: z.boolean().default(false),
  beliefLabelKey: Key,
  defaultThemeSlug: Slug,
});

export const FeltSenseVocabSchema = z.strictObject({
  code: z.enum(FELT_QUALITIES),
  displayNameKey: Key,
  valenceDefault: z.number().int().min(-1).max(1),
  colorTemp: z.enum(['warm', 'cool', 'neutral']),
  bodyRegionAffinity: z.array(z.enum(BODY_REGIONS)).default([]),
});

export const PhaseSchema = z.strictObject({
  seq: z.number().int().nonnegative(),
  type: z.enum(PHASE_TYPES),
  seconds: z.number().positive(),
  cueStyle: z.string().optional(),
  bodyRegionCode: z.enum(BODY_REGIONS).optional(),
  breathRoute: z.enum(BREATH_ROUTES).default('nasal'),
});

export const EnergyScriptSchema = z.strictObject({
  slug: Slug,
  traditionSlug: Slug,
  summaryKey: Key,
  events: z.array(EnergyEventSchema).min(1),
});

export const SessionTemplateSchema = z.strictObject({
  slug: Slug,
  techniqueSlug: Slug,
  durationSec: z.number().int().positive(),
  difficulty: z.enum(INTENSITY_CLASSES),
  posture: z.string().optional(),
  phases: z.array(PhaseSchema).min(1),
  defaultThemeSlug: Slug.optional(),
  defaultEnergyScriptSlug: Slug.optional(),
});

export const ContraindicationRuleSchema = z.strictObject({
  id: Slug,
  techniqueSlug: Slug.nullable().default(null),
  severity: z.enum(['info', 'caution', 'block']),
  conditionCode: z.string().min(1),
  messageKey: Key,
});

export const TechniqueGoalSchema = z.strictObject({
  goalCode: z.enum(GOAL_CODES),
  strength: z.number().min(0).max(1).default(1),
});

export const TechniqueSchema = z.strictObject({
  slug: Slug,
  canonicalNameKey: Key,
  aliases: z.array(z.string()).default([]),
  summaryKey: Key,
  primaryTraditionSlug: Slug.nullable().default(null),
  traditionSlugs: z.array(Slug).default([]),
  goals: z.array(TechniqueGoalSchema).default([]),
  intensityClass: z.enum(INTENSITY_CLASSES),
  requiresSafetyGate: z.boolean().default(false),
  feltExperienceKey: Key.optional(),
  safetyNotesKey: Key.optional(),
});

export const MediaAssetSchema = z
  .strictObject({
    id: Slug,
    kind: z.enum(['audio', 'image', 'rive', 'lottie', 'font']),
    locale: z.string().default('en'),
    uri: z.string().min(1),
    bundled: z.boolean().default(true),
    checksum: z.string().optional(),
    licence: z.string().min(1),
    attribution: z.string().min(1),
    rightsClass: z.enum(RIGHTS_CLASSES),
    packSlug: Slug.optional(),
    durationMs: z.number().int().nonnegative().optional(),
  })
  // Build-time rights gate: license + attribution are mandatory; commercial use blocks CC-BY-NC.
  .refine((a) => a.licence.trim().length > 0 && a.attribution.trim().length > 0, {
    message: 'media_asset requires non-empty licence and attribution',
  });

export const ContentPackSchema = z.strictObject({
  slug: Slug,
  kind: z.enum(PACK_KINDS),
  traditionSlug: Slug.nullable().default(null),
  version: z.number().int().positive(),
  sizeBytes: z.number().int().nonnegative().default(0),
  /** Languages this pack ships content in. English is always implicitly included (the build normalizes it). */
  availableLocales: z.array(z.string()).default(['en']),
  checksum: z.string().optional(),
  licenseSummaryKey: Key.optional(),
  minAppVersion: z.string().optional(),
});

export const BodyRegionSchema = z.strictObject({
  code: z.enum(BODY_REGIONS),
  displayNameKey: Key,
  view: z.enum(BODY_VIEWS),
  svgRegionId: z.string().optional(),
});

export const TranslationStringSchema = z.strictObject({
  key: Key,
  locale: z.string(),
  value: z.string(),
  rtl: z.boolean().default(false),
});

/** A full authored content bundle (one per pack). Validated by the content build. */
export const ContentBundleSchema = z.strictObject({
  pack: ContentPackSchema,
  traditions: z.array(TraditionSchema).default([]),
  energyCenters: z.array(EnergyCenterSchema).default([]),
  energyChannels: z.array(EnergyChannelSchema).default([]),
  bodyRegions: z.array(BodyRegionSchema).default([]),
  visualThemes: z.array(VisualThemeSchema).default([]),
  feltSenseVocab: z.array(FeltSenseVocabSchema).default([]),
  techniques: z.array(TechniqueSchema).default([]),
  sessionTemplates: z.array(SessionTemplateSchema).default([]),
  energyScripts: z.array(EnergyScriptSchema).default([]),
  contraindicationRules: z.array(ContraindicationRuleSchema).default([]),
  mediaAssets: z.array(MediaAssetSchema).default([]),
  translations: z.array(TranslationStringSchema).default([]),
});

export type EnergyEvent = z.infer<typeof EnergyEventSchema>;
export type EnergyCenter = z.infer<typeof EnergyCenterSchema>;
export type EnergyChannel = z.infer<typeof EnergyChannelSchema>;
export type VisualTheme = z.infer<typeof VisualThemeSchema>;
export type Tradition = z.infer<typeof TraditionSchema>;
export type FeltSenseVocab = z.infer<typeof FeltSenseVocabSchema>;
export type Phase = z.infer<typeof PhaseSchema>;
export type EnergyScript = z.infer<typeof EnergyScriptSchema>;
export type SessionTemplate = z.infer<typeof SessionTemplateSchema>;
export type ContraindicationRule = z.infer<typeof ContraindicationRuleSchema>;
export type Technique = z.infer<typeof TechniqueSchema>;
export type MediaAsset = z.infer<typeof MediaAssetSchema>;
export type ContentPack = z.infer<typeof ContentPackSchema>;
export type BodyRegion = z.infer<typeof BodyRegionSchema>;
export type TranslationString = z.infer<typeof TranslationStringSchema>;
export type ContentBundle = z.infer<typeof ContentBundleSchema>;
