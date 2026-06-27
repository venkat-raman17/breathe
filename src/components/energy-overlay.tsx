/**
 * Tradition energy-script overlay for the session player. Renders a faint silhouette + central
 * channel with a glow that travels from the event's `fromRegion` to `toRegion` in sync with the
 * breath (the engine's phaseProgress), only during the bound phase. Reduce-motion holds the glow at
 * a static mid-point (no travel). Color comes from the event's colorToken; the channel echoes it.
 */
import { View } from 'react-native';
import Animated, { useAnimatedProps, useDerivedValue } from 'react-native-reanimated';
import Svg, { Circle, Defs, Line, Path, RadialGradient, Stop } from 'react-native-svg';

import type { EnergyEventInfo } from '@/db/repo';
import { BODY_VIEWBOX, REGION_POS, SILHOUETTE } from '@/session/body-layout';
import type { BreathEngine } from '@/session/engine';
import { useAppTheme } from '@/theme/ThemeProvider';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function EnergyOverlay({ engine, event }: { engine: BreathEngine; event: EnergyEventInfo }) {
  const { colors, reduceMotion } = useAppTheme();
  const { w, h } = BODY_VIEWBOX;

  const fromY = event.fromRegion
    ? (REGION_POS[event.fromRegion as keyof typeof REGION_POS]?.y ?? 162)
    : 162;
  const toY = event.toRegion
    ? (REGION_POS[event.toRegion as keyof typeof REGION_POS]?.y ?? 14)
    : 14;
  const color = /^#([0-9a-fA-F]{3,8})$/.test(event.colorToken) ? event.colorToken : colors.energyRise;
  const top = Math.min(fromY, toY);
  const bottom = Math.max(fromY, toY);

  const cy = useDerivedValue(() => {
    const i = Math.round(engine.phaseIndex.value);
    if (i < event.atPhaseSeq) return fromY;
    if (i > event.atPhaseSeq) return toY;
    return fromY + (toY - fromY) * engine.phaseProgress.value;
  });

  const glowProps = useAnimatedProps(() => ({
    cy: reduceMotion ? (fromY + toY) / 2 : cy.value,
  }));

  return (
    <View
      accessible={false}
      style={{ width: '100%', aspectRatio: w / h, alignSelf: 'center', maxWidth: 240 }}>
      <Svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%">
        <Defs>
          <RadialGradient id="energy-glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity={0.9} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>

        {/* Faint silhouette */}
        <Path d={SILHOUETTE.torso} fill={colors.surfaceElevated} fillOpacity={0.5} />
        <Circle
          cx={SILHOUETTE.head.cx}
          cy={SILHOUETTE.head.cy}
          r={SILHOUETTE.head.r}
          fill={colors.surfaceElevated}
          fillOpacity={0.5}
        />

        {/* Central channel */}
        <Line
          x1={100}
          y1={top - 4}
          x2={100}
          y2={bottom + 4}
          stroke={color}
          strokeWidth={3}
          strokeOpacity={reduceMotion ? 0.55 : 0.32}
          strokeLinecap="round"
        />

        {/* Traveling glow */}
        <AnimatedCircle cx={100} r={24} fill="url(#energy-glow)" animatedProps={glowProps} />
      </Svg>
    </View>
  );
}
