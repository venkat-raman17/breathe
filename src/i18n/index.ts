/**
 * Breathe — i18next singleton.
 *
 * Two namespaces: `chrome` (app-shell strings, bundled JSON below) and `content` (tradition/
 * practice strings loaded from the SQLite `translation_string` table at boot). English is the
 * fallback; a missing key returns the key itself (matches the `*_key` content convention).
 *
 * IMPORTANT: do NOT init on import. `SettingsProvider` calls `initI18n()` only AFTER the DB is
 * seeded, so content resources exist before any screen renders.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import chromeEn from './chrome/en.json';
import chromeHi from './chrome/hi.json';
import chromeTa from './chrome/ta.json';

export const SUPPORTED_LOCALES = ['en', 'hi', 'ta'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

/** Endonyms — each language shown in its own script, regardless of the current UI language. */
export const LOCALE_LABELS: Record<string, string> = {
  en: 'English',
  hi: 'हिन्दी',
  ta: 'தமிழ்',
};

const CHROME: Record<string, Record<string, unknown>> = {
  en: chromeEn as Record<string, unknown>,
  hi: chromeHi as Record<string, unknown>,
  ta: chromeTa as Record<string, unknown>,
};

let initialized = false;

function baseResources() {
  return {
    en: { chrome: CHROME.en, content: {} },
    hi: { chrome: CHROME.hi, content: {} },
    ta: { chrome: CHROME.ta, content: {} },
  };
}

/**
 * Initialize i18next once and load the given per-locale content dictionaries.
 * @param locale active locale
 * @param contentResources e.g. { en: {...}, ta: {...} } — always include `en` for fallback.
 */
export async function initI18n(
  locale: string,
  contentResources: Record<string, Record<string, string>>,
): Promise<typeof i18n> {
  if (!initialized) {
    await i18n.use(initReactI18next).init({
      lng: locale,
      fallbackLng: 'en',
      ns: ['chrome', 'content'],
      defaultNS: 'content',
      resources: baseResources(),
      interpolation: { escapeValue: false },
      returnNull: false,
      compatibilityJSON: 'v4',
    });
    initialized = true;
  }
  for (const [loc, dict] of Object.entries(contentResources)) {
    i18n.addResourceBundle(loc, 'content', dict, true, true);
  }
  if (i18n.language !== locale) await i18n.changeLanguage(locale);
  return i18n;
}

/** Switch language at runtime, loading the new locale's content bundle first. */
export async function switchLanguage(
  locale: string,
  content: Record<string, string>,
): Promise<void> {
  i18n.addResourceBundle(locale, 'content', content, true, true);
  await i18n.changeLanguage(locale);
}

export default i18n;
