import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';

import Theme from '@/constants/Theme';
import { getHealthLabel } from '@/data/mockAquariumData';
import type { Tank } from '@/types/aquarium';

type TopographicHeroProps = {
  tank: Tank;
};

function buildContourPaths(width: number, height: number): string[] {
  const paths: string[] = [];
  const rows = 8;
  const cols = 10;

  for (let row = 0; row < rows; row++) {
    const yBase = (height / (rows + 1)) * (row + 1);
    let d = `M 0 ${yBase}`;

    for (let col = 1; col <= cols; col++) {
      const x = (width / cols) * col;
      const wave =
        Math.sin(col * 0.9 + row * 0.6) * 12 +
        Math.cos(col * 0.4 + row * 1.1) * 8 +
        (row % 2 === 0 ? 6 : -4);
      const y = yBase + wave;
      d += ` L ${x} ${y}`;
    }
    paths.push(d);
  }

  for (let col = 0; col < cols; col++) {
    const xBase = (width / (cols + 1)) * (col + 1);
    let d = `M ${xBase} 0`;

    for (let row = 1; row <= rows; row++) {
      const y = (height / rows) * row;
      const wave =
        Math.cos(row * 0.8 + col * 0.5) * 10 +
        Math.sin(row * 0.3 + col * 0.9) * 6;
      const x = xBase + wave;
      d += ` L ${x} ${y}`;
    }
    paths.push(d);
  }

  return paths;
}

function getHealthColor(status: Tank['healthStatus']): string {
  switch (status) {
    case 'excellent':
      return Theme.success;
    case 'good':
      return Theme.accent;
    case 'attention':
      return Theme.warning;
    case 'critical':
      return Theme.danger;
  }
}

export default function TopographicHero({ tank }: TopographicHeroProps) {
  const width = 400;
  const height = 220;
  const contours = buildContourPaths(width, height);
  const healthColor = getHealthColor(tank.healthStatus);

  return (
    <View style={styles.container}>
      <View style={styles.gridWrap}>
        <Svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid slice">
          <Defs>
            <LinearGradient id="gridFade" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={Theme.accent} stopOpacity="0.5" />
              <Stop offset="100%" stopColor={Theme.accent} stopOpacity="0.05" />
            </LinearGradient>
          </Defs>

          {contours.map((d, i) => (
            <Path
              key={`contour-${i}`}
              d={d}
              stroke={Theme.accent}
              strokeWidth={i % 3 === 0 ? 1.2 : 0.6}
              strokeOpacity={0.25 + (i % 4) * 0.08}
              fill="none"
            />
          ))}

          {Array.from({ length: 12 }).map((_, i) => (
            <Line
              key={`h-${i}`}
              x1={0}
              y1={(height / 12) * i}
              x2={width}
              y2={(height / 12) * i}
              stroke={Theme.accent}
              strokeWidth={0.4}
              strokeOpacity={0.08}
            />
          ))}
          {Array.from({ length: 16 }).map((_, i) => (
            <Line
              key={`v-${i}`}
              x1={(width / 16) * i}
              y1={0}
              x2={(width / 16) * i}
              y2={height}
              stroke={Theme.accent}
              strokeWidth={0.4}
              strokeOpacity={0.08}
            />
          ))}

          <Path
            d={`M 0 ${height} L ${width} ${height} L ${width} 0`}
            stroke="url(#gridFade)"
            strokeWidth={2}
            fill="none"
            opacity={0.4}
          />
        </Svg>
      </View>

      <View style={styles.scanLine} />
      <View style={styles.vignette} />

      <View style={styles.content}>
        <Text style={styles.eyebrow}>ACTIVE TANK</Text>
        <Text style={styles.tankName}>{tank.name}</Text>

        <View style={styles.healthRow}>
          <View style={[styles.healthDot, { backgroundColor: healthColor }]} />
          <Text style={[styles.healthStatus, { color: healthColor }]}>
            {getHealthLabel(tank.healthStatus)}
          </Text>
          <View style={styles.scorePill}>
            <Text style={styles.scoreText}>{tank.healthScore}%</Text>
          </View>
        </View>

        <Text style={styles.meta}>
          {tank.volumeLiters}L · Last checked {tank.lastChecked}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background,
    borderBottomWidth: 1,
    borderBottomColor: Theme.tabBarBorder,
    overflow: 'hidden',
    minHeight: 240,
  },
  gridWrap: {
    ...StyleSheet.absoluteFill,
    opacity: 0.9,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '45%',
    height: 1,
    backgroundColor: Theme.accent,
    opacity: 0.15,
  },
  vignette: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
    // Simulated vignette via overlay
    borderWidth: 0,
    shadowColor: Theme.background,
    shadowOffset: { width: 0, height: 40 },
    shadowOpacity: 1,
    shadowRadius: 60,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    paddingBottom: 24,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: Theme.accent,
    marginBottom: 6,
  },
  tankName: {
    fontSize: 34,
    fontWeight: '800',
    color: Theme.text,
    letterSpacing: 0.5,
    textShadowColor: Theme.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  healthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: Theme.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  healthStatus: {
    fontSize: 15,
    fontWeight: '600',
  },
  scorePill: {
    marginLeft: 4,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Theme.glassBorder,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.accent,
  },
  meta: {
    marginTop: 8,
    fontSize: 12,
    color: Theme.textMuted,
  },
});
