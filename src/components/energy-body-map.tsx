/**
 * Generic, data-driven energy-body diagram (react-native-svg). Draws channels (by role) and
 * centers (by ordinal) for ANY tradition — no tradition-specific code. Colors come from each
 * row's `colorToken` (a hex shipped by the pack); non-hex tokens fall back to theme roles.
 * Decorative for screen readers — the textual center/channel lists carry the information.
 */
import { Fragment } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import type { EnergyCenterInfo, EnergyChannelInfo } from '@/db/repo';
import { useAppTheme } from '@/theme/ThemeProvider';

const VB_W = 200;
const VB_H = 360;
const TOP_Y = 48;
const BOT_Y = 320;

const isHex = (s: string) => /^#([0-9a-fA-F]{3,8})$/.test(s);

export interface EnergyBodyMapProps {
  centers: EnergyCenterInfo[];
  channels: EnergyChannelInfo[];
}

export function EnergyBodyMap({ centers, channels }: EnergyBodyMapProps) {
  const { colors } = useAppTheme();
  const cx = VB_W / 2;

  const ordinals = centers.map((c) => c.ordinal);
  const minO = ordinals.length ? Math.min(...ordinals) : 1;
  const maxO = ordinals.length ? Math.max(...ordinals) : 1;
  const yFor = (o: number) =>
    maxO === minO ? (TOP_Y + BOT_Y) / 2 : BOT_Y - ((o - minO) / (maxO - minO)) * (BOT_Y - TOP_Y);

  const channelColor = (ch: EnergyChannelInfo) => (isHex(ch.colorToken) ? ch.colorToken : colors.axis);
  const centerColor = (c: EnergyCenterInfo) => (isHex(c.colorToken) ? c.colorToken : colors.accent);

  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={{ width: '100%', aspectRatio: VB_W / VB_H, alignSelf: 'center', maxWidth: 280 }}>
      <Svg viewBox={`0 0 ${VB_W} ${VB_H}`} width="100%" height="100%">
        {channels.map((ch) => {
          const x = ch.role === 'left' ? cx - 26 : ch.role === 'right' ? cx + 26 : cx;
          const isCentral = ch.role === 'central';
          return (
            <Line
              key={ch.slug}
              x1={x}
              y1={TOP_Y - 6}
              x2={x}
              y2={BOT_Y + 6}
              stroke={channelColor(ch)}
              strokeWidth={isCentral ? 4 : 2}
              strokeOpacity={isCentral ? 0.9 : 0.55}
              strokeLinecap="round"
            />
          );
        })}
        {centers.map((c) => {
          const y = yFor(c.ordinal);
          const fill = centerColor(c);
          return (
            <Fragment key={c.slug}>
              <Circle cx={cx} cy={y} r={16} fill={fill} fillOpacity={0.18} />
              <Circle cx={cx} cy={y} r={9} fill={fill} />
            </Fragment>
          );
        })}
      </Svg>
    </View>
  );
}
