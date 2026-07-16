import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Fish, SunMoon } from 'lucide-react-native';

import GlassCard from '@/components/GlassCard';
import Theme from '@/constants/Theme';
import useCountdown, { formatCountdown } from '@/hooks/useCountdown';
import type { CountdownEvent } from '@/types/aquarium';

type CountdownCardProps = {
  event: CountdownEvent;
  onPress?: () => void;
  disabled?: boolean;
};

function CountdownIcon({ icon, isExpired }: { icon: CountdownEvent['icon']; isExpired: boolean }) {
  const color = isExpired ? Theme.danger : Theme.accent;
  if (icon === 'feed') {
    return <Fish color={color} size={22} strokeWidth={2} />;
  }
  return <SunMoon color={color} size={22} strokeWidth={2} />;
}

export default function CountdownCard({ event, onPress, disabled }: CountdownCardProps) {
  const parts = useCountdown(event.targetAt);
  const display = disabled ? '--:--:--' : formatCountdown(parts);
  const urgent = !disabled && parts.totalMs < 30 * 60 * 1000 && !parts.isExpired;

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (parts.isExpired && !disabled) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.35,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [parts.isExpired, pulseAnim, disabled]);

  return (
    <Pressable onPress={onPress} style={{ flex: 1 }} disabled={disabled || !onPress}>
      <Animated.View style={{ flex: 1, opacity: disabled ? 0.4 : (parts.isExpired ? pulseAnim : 1) }}>
        <GlassCard
          glow={!disabled && (urgent || parts.isExpired)}
          style={[
            styles.card,
            !disabled && urgent && styles.cardUrgent,
            !disabled && parts.isExpired && styles.cardExpired,
          ]}>
          <View style={styles.header}>
            <View style={[styles.iconWrap, !disabled && parts.isExpired && styles.iconWrapExpired]}>
              <CountdownIcon icon={event.icon} isExpired={parts.isExpired} />
            </View>
            <Text style={[styles.label, parts.isExpired && styles.labelExpired]}>
              {parts.isExpired ? 'OVERDUE' : event.label}
            </Text>
          </View>
          <Text style={[
            styles.timer,
            urgent && styles.timerUrgent,
            parts.isExpired && styles.timerExpired,
          ]}>
            {display}
          </Text>
          <Text style={[styles.hint, parts.isExpired && styles.hintExpired]}>
            {parts.isExpired ? 'ACTION REQUIRED' : urgent ? 'Starting soon' : 'Time remaining'}
          </Text>
        </GlassCard>
      </Animated.View>
    </Pressable>
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
  cardExpired: {
    borderColor: Theme.danger,
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
  iconWrapExpired: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.textMuted,
    letterSpacing: 0.3,
  },
  labelExpired: {
    color: Theme.danger,
    fontWeight: '700',
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
  timerExpired: {
    color: Theme.danger,
    textShadowColor: Theme.danger,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  hint: {
    marginTop: 4,
    fontSize: 11,
    color: Theme.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  hintExpired: {
    color: Theme.danger,
    fontWeight: '600',
  },
});
