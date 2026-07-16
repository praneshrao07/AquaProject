import { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CalendarClock, Plus, X, Check } from 'lucide-react-native';

import RoutineTaskItem from '@/components/reminders/RoutineTaskItem';
import Theme from '@/constants/Theme';
import { useAquariumData } from '@/contexts/AquariumDataContext';
import type { RoutineTask } from '@/types/aquarium';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const STANDARD_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export default function RemindersScreen() {
  const {
    routineTasks: tasks,
    addRoutineTask,
    toggleRoutineTaskComplete,
    toggleRoutineTaskAlarm,
    removeRoutineTask,
  } = useAquariumData();

  // Form & Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('09:00 AM');
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedAmPm, setSelectedAmPm] = useState<'AM' | 'PM'>('AM');

  useEffect(() => {
    const hh = String(selectedHour).padStart(2, '0');
    const mm = String(selectedMinute).padStart(2, '0');
    setNewTime(`${hh}:${mm} ${selectedAmPm}`);
  }, [selectedHour, selectedMinute, selectedAmPm]);
  const [newFrequency, setNewFrequency] = useState<RoutineTask['frequency']>('daily');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [intervalDays, setIntervalDays] = useState('3');
  const [dayOfWeek, setDayOfWeek] = useState('Sunday');

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const toggleDaySelection = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleAdd = useCallback(() => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;

    let dayOfWeekVal: string | undefined = undefined;
    let intervalDaysVal: number | undefined = undefined;
    let customDaysVal: string[] | undefined = undefined;

    if (newFrequency === 'weekly' || newFrequency === 'biweekly' || newFrequency === 'monthly') {
      dayOfWeekVal = dayOfWeek;
    } else if (newFrequency === 'interval') {
      intervalDaysVal = parseInt(intervalDays) || 3;
    } else if (newFrequency === 'custom-days') {
      customDaysVal = selectedDays;
    }

    addRoutineTask(trimmed, newTime, newFrequency, dayOfWeekVal, intervalDaysVal, customDaysVal);
    
    // Reset Form
    setNewTitle('');
    setNewTime('09:00 AM');
    setNewFrequency('daily');
    setSelectedDays([]);
    setIntervalDays('3');
    setDayOfWeek('Sunday');
    setIsAddModalOpen(false);
  }, [
    newTitle,
    newTime,
    newFrequency,
    dayOfWeek,
    intervalDays,
    selectedDays,
    addRoutineTask,
  ]);

  const handleToggleComplete = useCallback((id: string) => {
    toggleRoutineTaskComplete(id);
  }, [toggleRoutineTaskComplete]);

  const handleToggleAlarm = useCallback((id: string) => {
    toggleRoutineTaskAlarm(id);
  }, [toggleRoutineTaskAlarm]);

  const handleRemove = useCallback((id: string) => {
    removeRoutineTask(id);
  }, [removeRoutineTask]);

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
            onSubmitEditing={openAddModal}
            returnKeyType="next"
          />
          <Pressable
            onPress={openAddModal}
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

      {/* Add Task Modal */}
      <Modal
        visible={isAddModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAddModalOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setIsAddModalOpen(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Routine Task</Text>
              <Pressable
                onPress={() => setIsAddModalOpen(false)}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
                <X color={Theme.textMuted} size={18} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ gap: 14 }} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>TASK DESCRIPTION</Text>
                <TextInput
                  style={styles.input}
                  value={newTitle}
                  onChangeText={setNewTitle}
                  placeholder="e.g. Wipe inner glass surface"
                  placeholderTextColor={Theme.textDim}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>TIME OF DAY</Text>
                <View style={styles.pickerRow}>
                  {/* Hour Picker */}
                  <View style={styles.pickerContainer}>
                    <Pressable
                      onPress={() => setSelectedHour(h => h === 1 ? 12 : h - 1)}
                      style={({ pressed }) => [styles.pickerBtn, pressed && styles.pressed]}>
                      <Text style={styles.pickerBtnText}>-</Text>
                    </Pressable>
                    <View style={styles.pickerValBox}>
                      <Text style={styles.pickerValText}>{String(selectedHour).padStart(2, '0')}</Text>
                      <Text style={styles.pickerSubtext}>Hr</Text>
                    </View>
                    <Pressable
                      onPress={() => setSelectedHour(h => h === 12 ? 1 : h + 1)}
                      style={({ pressed }) => [styles.pickerBtn, pressed && styles.pressed]}>
                      <Text style={styles.pickerBtnText}>+</Text>
                    </Pressable>
                  </View>

                  <Text style={styles.pickerSeparator}>:</Text>

                  {/* Minute Picker */}
                  <View style={styles.pickerContainer}>
                    <Pressable
                      onPress={() => setSelectedMinute(m => m === 0 ? 59 : m - 1)}
                      style={({ pressed }) => [styles.pickerBtn, pressed && styles.pressed]}>
                      <Text style={styles.pickerBtnText}>-</Text>
                    </Pressable>
                    <View style={styles.pickerValBox}>
                      <Text style={styles.pickerValText}>{String(selectedMinute).padStart(2, '0')}</Text>
                      <Text style={styles.pickerSubtext}>Min</Text>
                    </View>
                    <Pressable
                      onPress={() => setSelectedMinute(m => m === 59 ? 0 : m + 1)}
                      style={({ pressed }) => [styles.pickerBtn, pressed && styles.pressed]}>
                      <Text style={styles.pickerBtnText}>+</Text>
                    </Pressable>
                  </View>

                  {/* AM/PM Toggle */}
                  <View style={styles.ampmContainer}>
                    <Pressable
                      onPress={() => setSelectedAmPm('AM')}
                      style={[styles.ampmBtn, selectedAmPm === 'AM' && styles.ampmBtnActive]}>
                      <Text style={[styles.ampmBtnText, selectedAmPm === 'AM' && styles.ampmBtnTextActive]}>AM</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setSelectedAmPm('PM')}
                      style={[styles.ampmBtn, selectedAmPm === 'PM' && styles.ampmBtnActive]}>
                      <Text style={[styles.ampmBtnText, selectedAmPm === 'PM' && styles.ampmBtnTextActive]}>PM</Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>FREQUENCY</Text>
                <View style={styles.freqGrid}>
                  {(['daily', 'weekly', 'biweekly', 'monthly', 'custom-days', 'interval'] as const).map((freq) => {
                    const active = newFrequency === freq;
                    let label = freq.replace('-', ' ');
                    return (
                      <Pressable
                        key={freq}
                        onPress={() => setNewFrequency(freq)}
                        style={[styles.freqBtn, active && styles.freqBtnActive]}>
                        <Text style={[styles.freqBtnText, active && styles.freqBtnTextActive]}>
                          {label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {newFrequency === 'custom-days' && (
                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>SELECT SPECIFIC DAYS</Text>
                  <View style={styles.daysRow}>
                    {DAYS_OF_WEEK.map((day) => {
                      const selected = selectedDays.includes(day);
                      return (
                        <Pressable
                          key={day}
                          onPress={() => toggleDaySelection(day)}
                          style={[styles.dayChip, selected && styles.dayChipActive]}>
                          <Text style={[styles.dayChipText, selected && styles.dayChipTextActive]}>
                            {day}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}

              {newFrequency === 'interval' && (
                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>REPEAT INTERVAL (IN DAYS)</Text>
                  <TextInput
                    style={styles.input}
                    value={intervalDays}
                    onChangeText={setIntervalDays}
                    placeholder="e.g. 3"
                    placeholderTextColor={Theme.textDim}
                    keyboardType="numeric"
                  />
                </View>
              )}

              {(newFrequency === 'weekly' || newFrequency === 'biweekly' || newFrequency === 'monthly') && (
                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>DAY OF WEEK</Text>
                  <View style={styles.daysGrid}>
                    {STANDARD_DAYS.map((day) => {
                      const active = dayOfWeek === day;
                      return (
                        <Pressable
                          key={day}
                          onPress={() => setDayOfWeek(day)}
                          style={[styles.freqBtn, active && styles.freqBtnActive, { width: '30%', minWidth: 80 }]}>
                          <Text style={[styles.freqBtnText, active && styles.freqBtnTextActive]}>
                            {day.slice(0, 3)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}

              <Pressable
                onPress={handleAdd}
                style={({ pressed }) => [
                  styles.saveButton,
                  !newTitle.trim() && styles.saveButtonDisabled,
                  pressed && styles.pressed,
                ]}
                disabled={!newTitle.trim()}>
                <Check color={Theme.background} size={18} strokeWidth={2.5} />
                <Text style={styles.saveButtonText}>Add Task</Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Theme.overlay,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    backgroundColor: Theme.glass,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Theme.glassBorder,
    padding: 20,
    shadowColor: Theme.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Theme.background,
    borderWidth: 1,
    borderColor: Theme.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Theme.textDim,
    letterSpacing: 1,
    marginBottom: 8,
  },
  freqGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  freqBtn: {
    width: '31%',
    minWidth: 80,
    backgroundColor: Theme.background,
    borderWidth: 1,
    borderColor: Theme.glassBorder,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  freqBtnActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderColor: Theme.accent,
  },
  freqBtnText: {
    fontSize: 11,
    color: Theme.textMuted,
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  freqBtnTextActive: {
    color: Theme.accent,
    fontWeight: '700',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayChip: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 42,
    backgroundColor: Theme.background,
    borderWidth: 1,
    borderColor: Theme.glassBorder,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderColor: Theme.accent,
  },
  dayChipText: {
    fontSize: 11,
    color: Theme.textMuted,
    fontWeight: '600',
  },
  dayChipTextActive: {
    color: Theme.accent,
    fontWeight: '800',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Theme.accent,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 8,
    shadowColor: Theme.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: Theme.glass,
    borderColor: Theme.glassBorder,
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Theme.background,
  },
  pressed: {
    opacity: 0.8,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 4,
  },
  pickerContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.background,
    borderWidth: 1,
    borderColor: Theme.glassBorder,
    borderRadius: 14,
    overflow: 'hidden',
  },
  pickerBtn: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  pickerBtnText: {
    color: Theme.accent,
    fontSize: 18,
    fontWeight: '700',
  },
  pickerValBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  pickerValText: {
    color: Theme.text,
    fontSize: 16,
    fontWeight: '700',
  },
  pickerSubtext: {
    color: Theme.textDim,
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: -2,
  },
  pickerSeparator: {
    color: Theme.textMuted,
    fontSize: 22,
    fontWeight: '700',
    paddingHorizontal: 2,
  },
  ampmContainer: {
    flex: 1.5,
    flexDirection: 'row',
    backgroundColor: Theme.background,
    borderWidth: 1,
    borderColor: Theme.glassBorder,
    borderRadius: 14,
    overflow: 'hidden',
    height: 48,
  },
  ampmBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ampmBtnActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
  },
  ampmBtnText: {
    color: Theme.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  ampmBtnTextActive: {
    color: Theme.accent,
    fontWeight: '800',
  },
});
