/**
 * Breath engine — a UI-thread pacing clock (Reanimated frame callback) that advances through a
 * program's phases. Exposes shared values (phaseIndex / phaseProgress / per-phase scale arrays) for
 * the pacer to animate jank-free, plus React state (status, current phase, cycle, remaining) and
 * controls (pause / resume / slow / stop). Phase transitions and completion fire JS callbacks for
 * cues + logging. The clock runs entirely offline on the UI thread.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { runOnJS, useFrameCallback, useSharedValue, type SharedValue } from 'react-native-reanimated';

import { PHASE_GRAMMAR } from '@/theme/tokens';
import type { ProgramPhase } from './program';

export type EngineStatus = 'running' | 'paused' | 'complete';

export interface BreathEngine {
  phaseIndex: SharedValue<number>;
  phaseProgress: SharedValue<number>;
  scaleFrom: SharedValue<number[]>;
  scaleTo: SharedValue<number[]>;
  status: EngineStatus;
  phase: ProgramPhase;
  cycle: number;
  remainingSec: number;
  slow: boolean;
  pause: () => void;
  resume: () => void;
  toggleSlow: () => void;
  stop: () => void;
}

export interface BreathEngineOptions {
  onPhaseChange?: (phase: ProgramPhase, index: number) => void;
  onComplete?: () => void;
}

const SLOW_FACTOR = 1.35;

export function useBreathEngine(
  phases: ProgramPhase[],
  durationSec: number,
  options: BreathEngineOptions = {},
): BreathEngine {
  const baseDurations = useMemo(() => phases.map((p) => p.seconds * 1000), [phases]);
  const fromArr = useMemo<number[]>(() => phases.map((p) => PHASE_GRAMMAR[p.type].scaleFrom), [phases]);
  const toArr = useMemo<number[]>(() => phases.map((p) => PHASE_GRAMMAR[p.type].scaleTo), [phases]);
  const targetMs = durationSec * 1000;

  const phaseIndex = useSharedValue(0);
  const phaseProgress = useSharedValue(0);
  const elapsed = useSharedValue(0);
  const total = useSharedValue(0);
  const running = useSharedValue(true);
  const cycleSv = useSharedValue(0);
  const lastRem = useSharedValue(durationSec);
  const durations = useSharedValue(baseDurations);
  const scaleFrom = useSharedValue(fromArr);
  const scaleTo = useSharedValue(toArr);

  const [status, setStatus] = useState<EngineStatus>('running');
  const [index, setIndex] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [remainingSec, setRemainingSec] = useState(durationSec);
  const [slow, setSlow] = useState(false);

  // Keep the latest callbacks in a ref so the captured worklet bridge never goes stale.
  const cbRef = useRef(options);
  cbRef.current = options;

  const jsPhase = useCallback(
    (i: number) => {
      setIndex(i);
      cbRef.current.onPhaseChange?.(phases[i], i);
    },
    [phases],
  );
  const jsCycle = useCallback((c: number) => setCycle(c), []);
  const jsRemaining = useCallback((s: number) => setRemainingSec(s), []);
  const jsComplete = useCallback(() => {
    setStatus('complete');
    cbRef.current.onComplete?.();
  }, []);

  const frame = useFrameCallback((info) => {
    'worklet';
    if (!running.value) return;
    const dt = info.timeSincePreviousFrame ?? 16;
    elapsed.value += dt;
    total.value += dt;

    if (total.value >= targetMs) {
      running.value = false;
      phaseProgress.value = 1;
      runOnJS(jsComplete)();
      return;
    }

    const dur = durations.value[phaseIndex.value] ?? 1000;
    if (elapsed.value >= dur) {
      elapsed.value -= dur;
      let next = phaseIndex.value + 1;
      if (next >= durations.value.length) {
        next = 0;
        cycleSv.value += 1;
        runOnJS(jsCycle)(cycleSv.value);
      }
      phaseIndex.value = next;
      phaseProgress.value = 0;
      runOnJS(jsPhase)(next);
    } else {
      phaseProgress.value = elapsed.value / dur;
    }

    const remSec = Math.ceil((targetMs - total.value) / 1000);
    if (remSec !== lastRem.value) {
      lastRem.value = remSec;
      runOnJS(jsRemaining)(remSec);
    }
  }, true);

  // Fire the first phase cue once on mount.
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    cbRef.current.onPhaseChange?.(phases[0], 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pause = useCallback(() => {
    running.value = false;
    frame.setActive(false);
    setStatus('paused');
  }, [frame, running]);

  const resume = useCallback(() => {
    running.value = true;
    frame.setActive(true);
    setStatus('running');
  }, [frame, running]);

  const stop = useCallback(() => {
    running.value = false;
    frame.setActive(false);
  }, [frame, running]);

  const toggleSlow = useCallback(() => {
    setSlow((s) => {
      const next = !s;
      durations.value = baseDurations.map((d) => d * (next ? SLOW_FACTOR : 1));
      return next;
    });
  }, [baseDurations, durations]);

  return {
    phaseIndex,
    phaseProgress,
    scaleFrom,
    scaleTo,
    status,
    phase: phases[index] ?? phases[0],
    cycle,
    remainingSec,
    slow,
    pause,
    resume,
    toggleSlow,
    stop,
  };
}
