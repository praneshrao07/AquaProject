import { StyleSheet, Text, View } from 'react-native';
import { Fish, SunMoon } from 'lucide-react-native';

import GlassCard from '@/components/GlassCard';
import Theme from '@/constants/Theme';
import useCountdown, { formatCountdown } from '@/hooks/useCountdown';
import type { CountdownEvent } from '@/types/aquarium';

type CountdownCardProps = {
  event: CountdownEvent;
};

function CountdownIcon({ icon }: { icon: CountdownEvent['icon'] }) {
  if (icon === 'feed') {
    return <Fish color={Theme.accent} size={22} strokeWidth={2} />;
  }
  return <SunMoon color={Theme.accent} size={22} strokeWidth={2} />;
}

export default function CountdownCard({ event }: CountdownCardProps) {
  const parts = useCountdown(event.targetAt);
  const display = formatCountdown(parts);
  const urgent = parts.totalMs < 30 * 60 * 1000 && !parts.isExpired;

  return (
    <GlassCard
      glow={urgent}
      style={[styles.card, urgent && styles.cardUrgent]}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <CountdownIcon icon={event.icon} />
        </View>
        <Text style={styles.label}>{event.label}</Text>
      </View>
      <Text style={[styles.timer, urgent && styles.timerUrgent]}>{display}</Text>
      <Text style={styles.hint}>
        {parts.isExpired ? 'Event due now' : urgent ? 'Starting soon' : 'Time remaining'}
      </Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderColor: Theme.glassBorder,
  },
  cardUrgent: {
    borderColor: Theme.accent,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.glassBorder,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.textMuted,
    letterSpacing: 0.3,
  },
  timer: {
    fontSize: 28,
    fontWeight: '800',
    color: Theme.text,
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
  timerUrgent: {
    color: Theme.accent,
    textShadowColor: Theme.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  hint: {
    marginTop: 4,
    fontSize: 11,
    color: Theme.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
