/**
 * Active-tradition provider.
 *
 * The app delivers ONE combined experience per tradition (breath mechanics + felt sense +
 * tradition symbolism woven together, tradition-forward) — there is no user-facing "lens"
 * choice. The active tradition drives theming and which energy-body model is shown; it is
 * set when the user enters a tradition or starts one of its practices. v1 defaults to Yogic.
 *
 * TODO(persistence): mirror into user_profile.active_tradition so it survives restarts.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export const DEFAULT_TRADITION = 'yogic';

interface TraditionContextValue {
  traditionSlug: string;
  setTradition: (slug: string) => void;
}

const TraditionContext = createContext<TraditionContextValue | null>(null);

export function TraditionProvider({ children }: { children: ReactNode }) {
  const [traditionSlug, setTraditionState] = useState<string>(DEFAULT_TRADITION);
  const setTradition = useCallback((slug: string) => setTraditionState(slug), []);
  const value = useMemo(() => ({ traditionSlug, setTradition }), [traditionSlug, setTradition]);
  return <TraditionContext.Provider value={value}>{children}</TraditionContext.Provider>;
}

export function useTradition(): TraditionContextValue {
  const ctx = useContext(TraditionContext);
  if (!ctx) throw new Error('useTradition must be used within a TraditionProvider');
  return ctx;
}
