import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Droplets, Flame, Fish, Wind } from 'lucide-react-native';

import NeonSwitch from '@/components/NeonSwitch';
import Theme from '@/constants/Theme';
import type { QuickAction } from '@/types/aquarium';

type QuickActionToggleProps = {
  action: QuickAction;
  onToggle: (id: string, enabled: boolean) => void;
};

function ActionIcon({ icon, active }: { icon: QuickAction['icon']; active: boolean }) {
  const color = active ? Theme.accent : Theme.textDim;
  const size = 18;

  switch (icon) {
    case 'filter':
      return <Wind color={color} size={size} strokeWidth={2} />;
    case 'heater':
      return <Flame color={color} size={size} strokeWidth={2} />;
    case 'co2':
      return <Droplets color={color} size={size} strokeWidth={2} />;
    case 'feeder':
      return <Fish color={color} size={size} strokeWidth={2} />;
  }
}

export default function QuickActionToggle({ action, onToggle }: QuickActionToggleProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        action.enabled && styles.cardActive,
        pressed && styles.pressed,
      ]}>
      <View style={[styles.iconWrap, action.enabled && styles.iconWrapActive]}>
        <ActionIcon icon={action.icon} active={action.enabled} />
      </View>
      <Text style={[styles.label, action.enabled && styles.labelActive]} numberOfLines={1}>
        {action.label}
      </Text>
      <NeonSwitch
        value={action.enabled}
        onValueChange={(value) => onToggle(action.id, value)}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: Theme.glass,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Theme.glassBorder,
    padding: 14,
    gap: 8,
  },
  cardActive: {
    borderColor: Theme.accent,
    backgroundColor: 'rgba(168, 85, 247, 0.08)',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Theme.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.tabBarBorder,
  },
  iconWrapActive: {
    borderColor: Theme.glassBorder,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.textMuted,
  },
  labelActive: {
    color: Theme.text,
  },
  pressed: {
    opacity: 0.8,
  },
});
