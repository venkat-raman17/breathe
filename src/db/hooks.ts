/**
 * Breathe — React hooks over the async SQLite repository. A tiny dependency-free query hook
 * (loading/error/data + reload) plus thin wrappers. No React Query needed (offline, tiny dataset).
 */
import { useCallback, useEffect, useState, type DependencyList } from 'react';

import {
  getBodyRegions,
  getContentPacks,
  getEnergyCenter,
  getEnergyCenters,
  getEnergyChannels,
  getFeltSenseVocab,
  getRecentReflections,
  getTechnique,
  getTechniquesForGoal,
  getTechniquesForTradition,
  getTradition,
  getTraditions,
  type BodyRegionInfo,
  type ContentPackInfo,
  type EnergyCenterInfo,
  type EnergyChannelInfo,
  type FeltVocabInfo,
  type ReflectionInfo,
  type TechniqueInfo,
  type TraditionInfo,
} from './repo';

export interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  reload: () => void;
}

export function useQuery<T>(fn: () => Promise<T>, deps: DependencyList): QueryState<T> {
  const [state, setState] = useState<{ data: T | null; loading: boolean; error: Error | null }>({
    data: null,
    loading: true,
    error: null,
  });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true }));
    fn()
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((error: Error) => {
        if (active) setState({ data: null, loading: false, error });
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { ...state, reload };
}

export const useTraditions = () => useQuery<TraditionInfo[]>(() => getTraditions(), []);

export const useContentPacks = () => useQuery<ContentPackInfo[]>(() => getContentPacks(), []);

export const useTradition = (slug?: string) =>
  useQuery<TraditionInfo | null>(() => (slug ? getTradition(slug) : Promise.resolve(null)), [slug]);

export const useEnergyCenters = (slug?: string) =>
  useQuery<EnergyCenterInfo[]>(() => (slug ? getEnergyCenters(slug) : Promise.resolve([])), [slug]);

export const useEnergyCenter = (slug?: string) =>
  useQuery<EnergyCenterInfo | null>(
    () => (slug ? getEnergyCenter(slug) : Promise.resolve(null)),
    [slug],
  );

export const useEnergyChannels = (slug?: string) =>
  useQuery<EnergyChannelInfo[]>(
    () => (slug ? getEnergyChannels(slug) : Promise.resolve([])),
    [slug],
  );

export const useTechniquesForTradition = (slug?: string) =>
  useQuery<TechniqueInfo[]>(
    () => (slug ? getTechniquesForTradition(slug) : Promise.resolve([])),
    [slug],
  );

export const useTechnique = (slug?: string) =>
  useQuery<TechniqueInfo | null>(() => (slug ? getTechnique(slug) : Promise.resolve(null)), [slug]);

export const useTechniquesForGoal = (goalCode?: string) =>
  useQuery<TechniqueInfo[]>(
    () => (goalCode ? getTechniquesForGoal(goalCode) : Promise.resolve([])),
    [goalCode],
  );

export const useBodyRegions = () => useQuery<BodyRegionInfo[]>(() => getBodyRegions(), []);

export const useFeltVocab = () => useQuery<FeltVocabInfo[]>(() => getFeltSenseVocab(), []);

export const useRecentReflections = () =>
  useQuery<ReflectionInfo[]>(() => getRecentReflections(), []);
