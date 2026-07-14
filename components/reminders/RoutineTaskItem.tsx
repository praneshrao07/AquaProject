import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AlarmClock, Check, Trash2 } from 'lucide-react-native';

import NeonSwitch from '@/components/NeonSwitch';
import Theme from '@/constants/Theme';
import { formatSchedule } from '@/data/mockAquariumData';
import type { RoutineTask } from '@/types/aquarium';

type RoutineTaskItemProps = {
  task: RoutineTask;
  onToggleComplete: (id: string) => void;
  onToggleAlarm: (id: string) => void;
  onRemove: (id: string) => void;
};

export default function RoutineTaskItem({
  task,
  onToggleComplete,
  onToggleAlarm,
  onRemove,
}: RoutineTaskItemProps) {
  return (
    <View style={[styles.card, task.completed && styles.cardCompleted]}>
      <Pressable
        onPress={() => onToggleComplete(task.id)}
        style={({ pressed }) => [styles.checkButton, pressed && styles.pressed]}>
        <View style={[styles.checkbox, task.completed && styles.checkboxDone]}>
          {task.completed && <Check color={Theme.background} size={14} strokeWidth={3} />}
        </View>
      </Pressable>

      <View style={styles.content}>
        <Text style={[styles.title, task.completed && styles.titleDone]}>{task.title}</Text>
        <View style={styles.scheduleRow}>
          <AlarmClock color={Theme.textDim} size={12} />
          <Text style={styles.schedule}>{formatSchedule(task)}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <NeonSwitch
          value={task.alarmEnabled}
          onValueChange={() => onToggleAlarm(task.id)}
        />
        <Pressable
          onPress={() => onRemove(task.id)}
          hitSlop={8}
          style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}>
          <Trash2 color={Theme.danger} size={18} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.glass,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Theme.glassBorder,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  cardCompleted: {
    opacity: 0.65,
    borderColor: Theme.tabBarBorder,
  },
  checkButton: {
    padding: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: Theme.accent,
    borderColor: Theme.accent,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Theme.text,
    lineHeight: 20,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: Theme.textMuted,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 5,
  },
  schedule: {
    fontSize: 12,
    color: Theme.textDim,
  },
  actions: {
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    padding: 4,
  },
  pressed: {
    opacity: 0.7,
  },
});
