/**
 * Accessibility provider — merges live OS accessibility state (reduce-motion, screen-reader) with
 * the persisted app override (from SettingsProvider). Reduce-motion is a first-class input to every
 * animation (see docs/visual-design-system.md §7).
 */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AccessibilityInfo } from 'react-native';

import { useSettings } from './SettingsProvider';

export interface A11yState {
  /** True if OS Reduce Motion is on OR the user forced it in app settings. */
  reduceMotion: boolean;
  screenReaderEnabled: boolean;
  /** App override: 'system' defers to the OS; true/false force it. (Persisted.) */
  reduceMotionOverride: 'system' | boolean;
  setReduceMotionOverride: (v: 'system' | boolean) => void;
}

const A11yContext = createContext<A11yState | null>(null);

export function A11yProvider({ children }: { children: ReactNode }) {
  const { reduceMotionOverride, setReduceMotionOverride } = useSettings();
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => mounted && setSystemReduceMotion(v));
    AccessibilityInfo.isScreenReaderEnabled().then((v) => mounted && setScreenReaderEnabled(v));
    const motionSub = AccessibilityInfo.addEventListener('reduceMotionChanged', setSystemReduceMotion);
    const srSub = AccessibilityInfo.addEventListener('screenReaderChanged', setScreenReaderEnabled);
    return () => {
      mounted = false;
      motionSub.remove();
      srSub.remove();
    };
  }, []);

  const value = useMemo<A11yState>(() => {
    const reduceMotion =
      reduceMotionOverride === 'system' ? systemReduceMotion : reduceMotionOverride;
    return { reduceMotion, screenReaderEnabled, reduceMotionOverride, setReduceMotionOverride };
  }, [systemReduceMotion, screenReaderEnabled, reduceMotionOverride, setReduceMotionOverride]);

  return <A11yContext.Provider value={value}>{children}</A11yContext.Provider>;
}

export function useA11y(): A11yState {
  const ctx = useContext(A11yContext);
  if (!ctx) throw new Error('useA11y must be used within an A11yProvider');
  return ctx;
}
