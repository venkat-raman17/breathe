/**
 * Active-tradition shim. Tradition state now lives in (and is persisted by) SettingsProvider;
 * this preserves the `useTradition()` API used by screens that switch the active tradition.
 */
import { useSettings } from './SettingsProvider';

export { DEFAULT_TRADITION } from './SettingsProvider';

export function useTradition() {
  const { activeTradition, setActiveTradition } = useSettings();
  return { traditionSlug: activeTradition, setTradition: setActiveTradition };
}
