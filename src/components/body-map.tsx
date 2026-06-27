/**
 * Interactive front-view body map. `capture` mode shows tappable region hotspots; both modes render
 * felt-sense glows (radial gradients) sized by intensity and colored by the quality's temperature.
 * Static (reduce-motion-safe). Generic — regions come from the DB; positions from body-layout.
 */
import { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';

import { BODY_VIEWBOX, REGION_POS, SILHOUETTE, tempColor } from '@/session/body-layout';
import { useAppTheme } from '@/theme/ThemeProvider';

export interface BodyGlow {
  regionCode: string;
  /** 1..3 */
  intensity: number;
  colorTemp?: string;
}

export interface BodyMapProps {
  /** Tappable region codes (capture mode). */
  regions?: string[];
  /** Glows to render (both modes). */
  glows?: BodyGlow[];
  mode?: 'capture' | 'view';
  selected?: string | null;
  onSelectRegion?: (code: string) => void;
  maxWidth?: number;
}

export function BodyMap({
  regions = [],
  glows = [],
  mode = 'view',
  selected,
  onSelectRegion,
  maxWidth = 280,
}: BodyMapProps) {
  const { colors } = useAppTheme();
  const { w, h } = BODY_VIEWBOX;

  const tappable = useMemo(() => regions.filter((c) => REGION_POS[c as keyof typeof REGION_POS]), [regions]);

  return (
    <View
      accessible={mode !== 'capture'}
      style={{ width: '100%', aspectRatio: w / h, alignSelf: 'center', maxWidth }}>
      <Svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%">
        <Defs>
          {glows.map((g) => (
            <RadialGradient key={`def-${g.regionCode}`} id={`glow-${g.regionCode}`} cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={tempColor(g.colorTemp, colors.accent)} stopOpacity={0.8} />
              <Stop offset="100%" stopColor={tempColor(g.colorTemp, colors.accent)} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>

        {/* Silhouette */}
        <Path d={SILHOUETTE.armLeft} stroke={colors.surfaceElevated} strokeWidth={14} strokeLinecap="round" />
        <Path d={SILHOUETTE.armRight} stroke={colors.surfaceElevated} strokeWidth={14} strokeLinecap="round" />
        <Path d={SILHOUETTE.legLeft} stroke={colors.surfaceElevated} strokeWidth={16} strokeLinecap="round" />
        <Path d={SILHOUETTE.legRight} stroke={colors.surfaceElevated} strokeWidth={16} strokeLinecap="round" />
        <Path d={SILHOUETTE.torso} fill={colors.surfaceElevated} />
        <Circle cx={SILHOUETTE.head.cx} cy={SILHOUETTE.head.cy} r={SILHOUETTE.head.r} fill={colors.surfaceElevated} />

        {/* Felt-sense glows */}
        {glows.map((g) => {
          const pos = REGION_POS[g.regionCode as keyof typeof REGION_POS];
          if (!pos) return null;
          const r = 16 + Math.min(3, Math.max(1, g.intensity)) * 10;
          return <Circle key={`glow-${g.regionCode}`} cx={pos.x} cy={pos.y} r={r} fill={`url(#glow-${g.regionCode})`} />;
        })}

        {/* Tap targets (capture mode) */}
        {mode === 'capture' &&
          tappable.map((code) => {
            const pos = REGION_POS[code as keyof typeof REGION_POS]!;
            const sel = selected === code;
            return (
              <Circle
                key={`tap-${code}`}
                cx={pos.x}
                cy={pos.y}
                r={18}
                fill={sel ? colors.accent : colors.surface}
                fillOpacity={sel ? 0.9 : 0.55}
                stroke={sel ? colors.accent : colors.border}
                strokeWidth={1.5}
                onPress={() => onSelectRegion?.(code)}
              />
            );
          })}
      </Svg>
    </View>
  );
}
