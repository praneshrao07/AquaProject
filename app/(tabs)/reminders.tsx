import { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CalendarClock, Plus } from 'lucide-react-native';

import RoutineTaskItem from '@/components/reminders/RoutineTaskItem';
import Theme from '@/constants/Theme';
import { initialRoutineTasks } from '@/data/mockAquariumData';
import type { RoutineTask } from '@/types/aquarium';

function createTaskId(): string {
  return `task-${Date.now()}`;
}

export default function RemindersScreen() {
  const [tasks, setTasks] = useState<RoutineTask[]>(initialRoutineTasks);
  const [newTitle, setNewTitle] = useState('');

  const handleAdd = useCallback(() => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;

    const newTask: RoutineTask = {
      id: createTaskId(),
      title: trimmed,
      completed: false,
      alarmEnabled: true,
      frequency: 'daily',
      time: '09:00 AM',
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTitle('');
  }, [newTitle]);

  const handleToggleComplete = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)),
    );
  }, []);

  const handleToggleAlarm = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, alarmEnabled: !task.alarmEnabled } : task,
      ),
    );
  }, []);

  const handleRemove = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.summaryCard}>
          <CalendarClock color={Theme.accent} size={24} />
          <View style={styles.summaryText}>
            <Text style={styles.summaryTitle}>Routine Checklist</Text>
            <Text style={styles.summarySubtitle}>
              {completedCount} of {tasks.length} tasks complete today
            </Text>
          </View>
        </View>

        <View style={styles.addRow}>
          <TextInput
            style={styles.input}
            placeholder="Add a new routine task..."
            placeholderTextColor={Theme.textDim}
            value={newTitle}
            onChangeText={setNewTitle}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
          />
          <Pressable
            onPress={handleAdd}
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
            <Plus color={Theme.background} size={22} strokeWidth={2.5} />
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>SCHEDULED ROUTINES</Text>
        {tasks.map((task) => (
          <RoutineTaskItem
            key={task.id}
            task={task}
            onToggleComplete={handleToggleComplete}
            onToggleAlarm={handleToggleAlarm}
            onRemove={handleRemove}
          />
        ))}

        {tasks.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No routines yet</Text>
            <Text style={styles.emptySubtitle}>Add your first task above to get started.</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Theme.glass,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Theme.glassBorder,
    padding: 18,
    marginBottom: 16,
  },
  summaryText: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.text,
  },
  summarySubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: Theme.textMuted,
  },
  addRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: Theme.glass,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Theme.glassBorder,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Theme.text,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: Theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Theme.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: Theme.textDim,
    marginBottom: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.textMuted,
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: Theme.textDim,
  },
  pressed: {
    opacity: 0.75,
  },
});
