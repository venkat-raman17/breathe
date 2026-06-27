/**
 * Breathe — boot orchestrator + persisted app settings.
 *
 * On mount it: opens + seeds the DB, loads persisted settings (KV `app_setting`), computes the
 * device-default locale on first run, fills the theme registry, and initializes i18n with the
 * active + English content — THEN flips `ready`. The root layout holds the splash until `ready`,
 * so no screen renders before content/i18n exist. All setters persist to the KV store.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { getLocales } from 'expo-localization';

import { initData } from '@/db/seed';
import { getAllAppSettings, getTradition, getTranslations, setAppSetting } from '@/db/repo';
import { initI18n, switchLanguage, SUPPORTED_LOCALES } from '@/i18n';
import { loadThemeRegistry } from '@/theme/registry';

export const DEFAULT_TRADITION = 'yogic';

type ReduceMotionOverride = 'system' | boolean;

interface SettingsValue {
  ready: boolean;
  activeTradition: string;
  activeThemeSlug: string | null;
  activeLocale: string;
  onboardingCompleted: boolean;
  reduceMotionOverride: ReduceMotionOverride;
  setActiveTradition: (slug: string) => Promise<void>;
  setActiveLocale: (locale: string) => Promise<void>;
  setReduceMotionOverride: (v: ReduceMotionOverride) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const KEY = {
  tradition: 'active_tradition',
  locale: 'active_locale',
  onboarding: 'onboarding_completed',
  reduceMotion: 'reduce_motion_override',
} as const;

const SettingsContext = createContext<SettingsValue | null>(null);

function deviceDefaultLocale(): string {
  try {
    const code = getLocales()?.[0]?.languageCode ?? 'en';
    return (SUPPORTED_LOCALES as readonly string[]).includes(code) ? code : 'en';
  } catch {
    return 'en';
  }
}

function parseRMO(v: string | undefined): ReduceMotionOverride {
  if (v === 'true') return true;
  if (v === 'false') return false;
  return 'system';
}

function rmoToString(v: ReduceMotionOverride): string {
  return v === 'system' ? 'system' : v ? 'true' : 'false';
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [activeTradition, setActiveTraditionState] = useState(DEFAULT_TRADITION);
  const [activeThemeSlug, setActiveThemeSlug] = useState<string | null>(null);
  const [activeLocale, setActiveLocaleState] = useState('en');
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [reduceMotionOverride, setReduceMotionOverrideState] =
    useState<ReduceMotionOverride>('system');
  const booted = useRef(false);

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    (async () => {
      try {
        await initData(); // open + migrate + seed
        const settings = await getAllAppSettings();
        await loadThemeRegistry();

        const locale = settings[KEY.locale] || deviceDefaultLocale();
        const tradition = settings[KEY.tradition] || DEFAULT_TRADITION;
        const trad = await getTradition(tradition);

        const enContent = await getTranslations('en');
        const localeContent = locale === 'en' ? {} : await getTranslations(locale);
        await initI18n(locale, { en: enContent, [locale]: localeContent });

        setActiveTraditionState(tradition);
        setActiveThemeSlug(trad?.defaultThemeSlug ?? null);
        setActiveLocaleState(locale);
        setOnboardingCompleted(settings[KEY.onboarding] === 'true');
        setReduceMotionOverrideState(parseRMO(settings[KEY.reduceMotion]));
      } catch (err) {
        console.warn('[breathe] settings boot failed', err);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const setActiveTradition = useCallback(async (slug: string) => {
    await setAppSetting(KEY.tradition, slug);
    const trad = await getTradition(slug);
    setActiveTraditionState(slug);
    setActiveThemeSlug(trad?.defaultThemeSlug ?? null);
  }, []);

  const setActiveLocale = useCallback(async (locale: string) => {
    await setAppSetting(KEY.locale, locale);
    const content = locale === 'en' ? await getTranslations('en') : await getTranslations(locale);
    await switchLanguage(locale, content);
    setActiveLocaleState(locale);
  }, []);

  const setReduceMotionOverride = useCallback(async (v: ReduceMotionOverride) => {
    await setAppSetting(KEY.reduceMotion, rmoToString(v));
    setReduceMotionOverrideState(v);
  }, []);

  const completeOnboarding = useCallback(async () => {
    await setAppSetting(KEY.onboarding, 'true');
    setOnboardingCompleted(true);
  }, []);

  const value = useMemo<SettingsValue>(
    () => ({
      ready,
      activeTradition,
      activeThemeSlug,
      activeLocale,
      onboardingCompleted,
      reduceMotionOverride,
      setActiveTradition,
      setActiveLocale,
      setReduceMotionOverride,
      completeOnboarding,
    }),
    [
      ready,
      activeTradition,
      activeThemeSlug,
      activeLocale,
      onboardingCompleted,
      reduceMotionOverride,
      setActiveTradition,
      setActiveLocale,
      setReduceMotionOverride,
      completeOnboarding,
    ],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
}
