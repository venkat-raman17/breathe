/**
 * Breath pacer orb. Scales between the current phase's grammar endpoints, driven on the UI thread by
 * the engine's shared values. Under reduce-motion it holds a static mid-scale (no pulsing) — the
 * caption + haptics still carry the phase.
 */
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import type { BreathEngine } from '@/session/engine';
import { useAppTheme } from '@/theme/ThemeProvider';

export function BreathOrb({ engine }: { engine: BreathEngine }) {
  const { colors, reduceMotion } = useAppTheme();

  const animatedStyle = useAnimatedStyle(() => {
    const i = Math.round(engine.phaseIndex.value);
    const from = engine.scaleFrom.value[i] ?? 0.6;
    const to = engine.scaleTo.value[i] ?? 0.6;
    const scale = reduceMotion ? (from + to) / 2 : from + (to - from) * engine.phaseProgress.value;
    return { transform: [{ scale }] };
  });

  return (
    <View style={styles.wrap}>
      <View style={[styles.halo, { backgroundColor: colors.phaseHoldGlow }]} />
      <Animated.View
        style={[styles.orb, { backgroundColor: colors.phaseHoldGlow }, animatedStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 280, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: 210, height: 210, borderRadius: 105, opacity: 0.12 },
  orb: { width: 180, height: 180, borderRadius: 90, opacity: 0.9 },
});
