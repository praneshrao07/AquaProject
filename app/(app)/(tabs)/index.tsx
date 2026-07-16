import { useCallback, useState } from 'react';
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
import { X, Check } from 'lucide-react-native';

import CountdownCard from '@/components/home/CountdownCard';
import QuickActionToggle from '@/components/home/QuickActionToggle';
import TopographicHero from '@/components/home/TopographicHero';
import NeonSwitch from '@/components/NeonSwitch';
import Theme from '@/constants/Theme';
import { useAquariumData } from '@/contexts/AquariumDataContext';
import type { CountdownEvent } from '@/types/aquarium';

export default function HomeScreen() {
  const {
    tank,
    countdowns,
    quickActions,
    toggleQuickAction,
    updateTank,
    updateCountdown,
  } = useAquariumData();

  // Edit Tank State
  const [isTankModalOpen, setIsTankModalOpen] = useState(false);
  const [tankName, setTankName] = useState('');
  const [tankVolume, setTankVolume] = useState('');
  const [isPlanted, setIsPlanted] = useState(false);

  // Edit Timer State
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CountdownEvent | null>(null);
  const [customMinutes, setCustomMinutes] = useState('');

  const openTankModal = () => {
    setTankName(tank.name);
    setTankVolume(tank.volumeLiters.toString());
    setIsPlanted(tank.isPlanted ?? false);
    setIsTankModalOpen(true);
  };

  const handleSaveTank = async () => {
    const vol = parseFloat(tankVolume);
    if (!tankName.trim() || isNaN(vol) || vol <= 0) return;
    await updateTank({
      name: tankName.trim(),
      volumeLiters: vol,
      isPlanted,
    });
    setIsTankModalOpen(false);
  };

  const handleCountdownPress = (event: CountdownEvent) => {
    setSelectedEvent(event);
    setCustomMinutes('');
    setIsTimerModalOpen(true);
  };

  const handleResetCountdown = async (minutes: number) => {
    if (!selectedEvent) return;
    const target = new Date();
    target.setMinutes(target.getMinutes() + minutes);
    await updateCountdown(selectedEvent.id, target);
    setIsTimerModalOpen(false);
  };

  const handleToggle = useCallback(
    (id: string) => {
      toggleQuickAction(id);
    },
    [toggleQuickAction]
  );

  const activeSwitchesCount = quickActions.filter(a => a.enabled).length;
  let techStatusText = 'Low-tech Aquarium';
  if (activeSwitchesCount === 2) {
    techStatusText = 'Mid-tech Aquarium';
  } else if (activeSwitchesCount >= 3) {
    techStatusText = 'High-tech Aquarium';
  }

  return (
    <View style={styles.container}>
      <View style={styles.heroContainer}>
        <TopographicHero tank={tank} onEdit={openTankModal} />
      </View>

      <View style={styles.bottomWrapper}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>LIVE COUNTDOWNS</Text>
          <View style={styles.countdownRow}>
            {countdowns.map((event) => (
              <CountdownCard
                key={event.id}
                event={event}
                onPress={() => handleCountdownPress(event)}
                disabled={!tank.isPlanted && event.id === 'lights-off'}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>ECOSYSTEM CONTROLS</Text>
            <Text style={styles.techStatus}>{techStatusText}</Text>
          </View>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <QuickActionToggle
                key={action.id}
                action={action}
                onToggle={() => handleToggle(action.id)}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Edit Tank Details Modal */}
      <Modal
        visible={isTankModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsTankModalOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setIsTankModalOpen(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Configure Tank Details</Text>
              <Pressable
                onPress={() => setIsTankModalOpen(false)}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
                <X color={Theme.textMuted} size={18} />
              </Pressable>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>TANK NAME</Text>
              <TextInput
                style={styles.input}
                value={tankName}
                onChangeText={setTankName}
                placeholder="e.g. Reef Haven"
                placeholderTextColor={Theme.textDim}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>VOLUME (LITERS)</Text>
              <TextInput
                style={styles.input}
                value={tankVolume}
                onChangeText={setTankVolume}
                placeholder="e.g. 120"
                placeholderTextColor={Theme.textDim}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formRow}>
              <Text style={styles.inputLabel}>PLANTED TANK</Text>
              <NeonSwitch
                value={isPlanted}
                onValueChange={setIsPlanted}
              />
            </View>

            <Pressable
              onPress={handleSaveTank}
              style={({ pressed }) => [
                styles.saveButton,
                (!tankName.trim() || !tankVolume.trim()) && styles.saveButtonDisabled,
                pressed && styles.pressed,
              ]}
              disabled={!tankName.trim() || !tankVolume.trim()}>
              <Check color={Theme.background} size={18} strokeWidth={2.5} />
              <Text style={styles.saveButtonText}>Save Details</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Timer / Reset Countdown Modal */}
      <Modal
        visible={isTimerModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsTimerModalOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setIsTimerModalOpen(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reset {selectedEvent?.label}</Text>
              <Pressable
                onPress={() => setIsTimerModalOpen(false)}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
                <X color={Theme.textMuted} size={18} />
              </Pressable>
            </View>

            <Text style={styles.modalHint}>
              Select a quick interval preset to reset the countdown:
            </Text>

            <View style={styles.presetsGrid}>
              {selectedEvent?.icon === 'feed' ? (
                <>
                  <Pressable
                    style={styles.presetOption}
                    onPress={() => handleResetCountdown(240)}>
                    <Text style={styles.presetText}>4 Hours (Standard)</Text>
                  </Pressable>
                  <Pressable
                    style={styles.presetOption}
                    onPress={() => handleResetCountdown(480)}>
                    <Text style={styles.presetText}>8 Hours</Text>
                  </Pressable>
                  <Pressable
                    style={styles.presetOption}
                    onPress={() => handleResetCountdown(720)}>
                    <Text style={styles.presetText}>12 Hours</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Pressable
                    style={styles.presetOption}
                    onPress={() => handleResetCountdown(360)}>
                    <Text style={styles.presetText}>6 Hours (Standard)</Text>
                  </Pressable>
                  <Pressable
                    style={styles.presetOption}
                    onPress={() => handleResetCountdown(600)}>
                    <Text style={styles.presetText}>10 Hours</Text>
                  </Pressable>
                  <Pressable
                    style={styles.presetOption}
                    onPress={() => handleResetCountdown(720)}>
                    <Text style={styles.presetText}>12 Hours</Text>
                  </Pressable>
                </>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>CUSTOM DURATION (MINUTES)</Text>
              <View style={styles.customRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={customMinutes}
                  onChangeText={setCustomMinutes}
                  placeholder="e.g. 30"
                  placeholderTextColor={Theme.textDim}
                  keyboardType="numeric"
                />
                <Pressable
                  onPress={() => {
                    const mins = parseInt(customMinutes);
                    if (!isNaN(mins) && mins >= 0) {
                      handleResetCountdown(mins);
                    }
                  }}
                  style={({ pressed }) => [
                    styles.customApplyBtn,
                    (!customMinutes || isNaN(parseInt(customMinutes))) && styles.saveButtonDisabled,
                    pressed && styles.pressed,
                  ]}
                  disabled={!customMinutes || isNaN(parseInt(customMinutes))}>
                  <Text style={styles.customApplyText}>Apply</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background,
    justifyContent: 'space-between',
  },
  heroContainer: {
    flex: 1,
  },
  bottomWrapper: {
    padding: 16,
    paddingBottom: 24,
    gap: 16,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: Theme.textDim,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  techStatus: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  countdownRow: {
    flexDirection: 'row',
    gap: 12,
    height: 130,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: Theme.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.glassBorder,
    paddingHorizontal: 14,
    paddingVertical: 10,
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
    marginBottom: 6,
  },
  input: {
    backgroundColor: Theme.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.glassBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Theme.text,
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
  modalHint: {
    fontSize: 13,
    color: Theme.textMuted,
    lineHeight: 18,
    marginBottom: 16,
  },
  presetsGrid: {
    gap: 8,
    marginBottom: 16,
  },
  presetOption: {
    backgroundColor: Theme.background,
    borderWidth: 1,
    borderColor: Theme.glassBorder,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  presetText: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.accent,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.glassBorder,
    marginVertical: 16,
  },
  customRow: {
    flexDirection: 'row',
    gap: 10,
  },
  customApplyBtn: {
    backgroundColor: Theme.accent,
    borderRadius: 12,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customApplyText: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.background,
  },
  pressed: {
    opacity: 0.8,
  },
});
