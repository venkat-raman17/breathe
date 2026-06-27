# Translation review checklist

The Hindi (`hi`, Devanagari) and Tamil (`ta`, Tamil script) strings in this repo were drafted by an
AI assistant and **must be reviewed by a fluent human speaker / subject-matter expert** before release.
English (IAST where relevant) is the authoritative source and the i18n `fallbackLng`.

## What to review

- **App chrome:** `src/i18n/chrome/hi.json`, `src/i18n/chrome/ta.json` (tabs, onboarding, traditions,
  learn module, common). Compare against `src/i18n/chrome/en.json`.
- **Yogic content:** the `translations` array in `content/packs/yogic.bundle.json` — every key has
  `en` / `hi` / `ta` rows. Focus areas:
  - Sacred terms / chakra & nāḍī names (transliteration accuracy, correct Devanagari/Tamil spelling).
  - Bīja syllables (`bija.*`) — verify the Devanagari/Tamil renderings of LAM/VAM/RAM/YAM/HAM/OM.
  - Safety copy (`tech.bhastrika.safety`, `tech.nadi_shodhana.safety`) — must stay accurate and not
    soften contraindications.
  - The belief-label and classical-vs-modern color notes — keep the honest "modern synthesis" framing.

## Process

1. Review/correct the `hi` and `ta` `value` fields in the JSON above (do not change `key` or `locale`).
2. Run `pnpm build:content` to re-validate and regenerate `src/content/seed.generated.json`.
3. Verify in-app: onboard → pick Yogic + the locale → open the Traditions learn module and a center
   detail; confirm the script renders correctly and nothing falls back to English unexpectedly.

> Adding a new language to a pack: add its rows here, add the locale to the pack's `availableLocales`
> in the bundle, add a `src/i18n/chrome/<locale>.json`, and register it in `SUPPORTED_LOCALES`
> (`src/i18n/index.ts`).
