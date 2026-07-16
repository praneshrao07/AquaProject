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
import { Trash2, Plus, Minus, X, Check } from 'lucide-react-native';

import AccordionCard from '@/components/AccordionCard';
import Theme from '@/constants/Theme';
import { useAquariumData } from '@/contexts/AquariumDataContext';
import { mockPestReferences } from '@/data/mockAquariumData';
import type { PestReference, TankInhabitant, WaterParameter } from '@/types/aquarium';

function getParameterStatus(param: WaterParameter): { label: string; color: string } {
  if (param.current >= param.idealMin && param.current <= param.idealMax) {
    return { label: 'In Range', color: Theme.success };
  }
  if (param.current < param.idealMin) {
    return { label: 'Low', color: Theme.warning };
  }
  return { label: 'High', color: Theme.danger };
}

function getThreatColor(level: PestReference['threatLevel']): string {
  switch (level) {
    case 'low':
      return Theme.textMuted;
    case 'medium':
      return Theme.warning;
    case 'high':
      return '#F97316';
    case 'critical':
      return Theme.danger;
  }
}

function getTemperamentColor(temperament: TankInhabitant['temperament']): string {
  switch (temperament) {
    case 'peaceful':
      return Theme.success;
    case 'semi-aggressive':
      return Theme.warning;
    case 'aggressive':
      return Theme.danger;
  }
}

export default function InfoScreen() {
  const {
    inhabitants,
    waterParameters,
    addInhabitant,
    updateInhabitant,
    removeInhabitant,
    updateWaterParameter,
  } = useAquariumData();

  // Inhabitant Modal State
  const [isInhabitantModalOpen, setIsInhabitantModalOpen] = useState(false);
  const [inhabitantName, setInhabitantName] = useState('');
  const [inhabitantSpecies, setInhabitantSpecies] = useState('');
  const [inhabitantCount, setInhabitantCount] = useState('1');
  const [inhabitantTemperament, setInhabitantTemperament] = useState<TankInhabitant['temperament']>('peaceful');
  const [inhabitantNotes, setInhabitantNotes] = useState('');

  // Water Parameter Modal State
  const [isWaterModalOpen, setIsWaterModalOpen] = useState(false);
  const [selectedParam, setSelectedParam] = useState<WaterParameter | null>(null);
  const [waterValue, setWaterValue] = useState('');

  const handleAddInhabitant = async () => {
    const countNum = parseInt(inhabitantCount);
    if (!inhabitantName.trim() || !inhabitantSpecies.trim() || isNaN(countNum) || countNum <= 0) return;
    
    await addInhabitant(
      inhabitantName.trim(),
      inhabitantSpecies.trim(),
      countNum,
      inhabitantTemperament,
      inhabitantNotes.trim()
    );

    // Reset fields
    setInhabitantName('');
    setInhabitantSpecies('');
    setInhabitantCount('1');
    setInhabitantTemperament('peaceful');
    setInhabitantNotes('');
    setIsInhabitantModalOpen(false);
  };

  const openWaterModal = (param: WaterParameter) => {
    setSelectedParam(param);
    setWaterValue(param.current.toString());
    setIsWaterModalOpen(true);
  };

  const handleUpdateWater = async () => {
    if (!selectedParam) return;
    const valueNum = parseFloat(waterValue);
    if (isNaN(valueNum)) return;

    await updateWaterParameter(selectedParam.id, valueNum);
    setIsWaterModalOpen(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Tank Directory</Text>
      <Text style={styles.pageSubtitle}>
        Reference data for inhabitants, water chemistry, and pest identification.
      </Text>

      <AccordionCard
        title="Tank Inhabitants"
        subtitle="Species roster & temperament notes"
        badge={`${inhabitants.length} species`}
        defaultOpen>
        <Pressable
          onPress={() => setIsInhabitantModalOpen(true)}
          style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}>
          <Plus color={Theme.accent} size={15} strokeWidth={2.5} />
          <Text style={styles.addBtnText}>Add New Species</Text>
        </Pressable>

        {inhabitants.map((inhabitant, index) => (
          <View
            key={inhabitant.id}
            style={[styles.row, index < inhabitants.length - 1 && styles.rowBorder]}>
            <View style={styles.rowHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{inhabitant.name}</Text>
                <Text style={styles.species}>{inhabitant.species}</Text>
              </View>
              <View style={styles.countControlRow}>
                <Pressable
                  onPress={() => {
                    if (inhabitant.count > 1) {
                      updateInhabitant(inhabitant.id, { count: inhabitant.count - 1 });
                    }
                  }}
                  style={styles.adjustCountBtn}>
                  <Minus color={Theme.textMuted} size={12} strokeWidth={2.5} />
                </Pressable>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>×{inhabitant.count}</Text>
                </View>
                <Pressable
                  onPress={() => updateInhabitant(inhabitant.id, { count: inhabitant.count + 1 })}
                  style={styles.adjustCountBtn}>
                  <Plus color={Theme.textMuted} size={12} strokeWidth={2.5} />
                </Pressable>
                
                <Pressable
                  onPress={() => removeInhabitant(inhabitant.id)}
                  style={styles.deleteInhabitantBtn}>
                  <Trash2 color={Theme.danger} size={16} />
                </Pressable>
              </View>
            </View>
            <View style={styles.tagRow}>
              <View
                style={[
                  styles.tag,
                  { borderColor: `${getTemperamentColor(inhabitant.temperament)}40` },
                ]}>
                <Text
                  style={[styles.tagText, { color: getTemperamentColor(inhabitant.temperament) }]}>
                  {inhabitant.temperament}
                </Text>
              </View>
            </View>
            {inhabitant.notes ? <Text style={styles.notes}>{inhabitant.notes}</Text> : null}
          </View>
        ))}
      </AccordionCard>

      <AccordionCard
        title="Water Thresholds"
        subtitle="Ideal ranges vs. current readings (Tap to edit)"
        badge="Live">
        {waterParameters.map((param, index) => {
          const status = getParameterStatus(param);
          const rangeLabel =
            param.idealMin === param.idealMax
              ? `${param.idealMin}${param.unit}`
              : `${param.idealMin}–${param.idealMax}${param.unit}`;

          return (
            <Pressable
              key={param.id}
              onPress={() => openWaterModal(param)}
              style={({ pressed }) => [
                styles.paramRow,
                index < waterParameters.length - 1 && styles.rowBorder,
                pressed && styles.pressedRow,
              ]}>
              <View style={styles.paramHeader}>
                <Text style={styles.rowTitle}>{param.name}</Text>
                <Text style={[styles.statusBadge, { color: status.color }]}>{status.label}</Text>
              </View>
              <View style={styles.paramValues}>
                <View style={styles.paramBlock}>
                  <Text style={styles.paramLabel}>Current</Text>
                  <Text style={styles.paramValue}>
                    {param.current}
                    {param.unit}
                  </Text>
                </View>
                <View style={styles.paramDivider} />
                <View style={styles.paramBlock}>
                  <Text style={styles.paramLabel}>Ideal Range</Text>
                  <Text style={styles.paramRange}>{rangeLabel}</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </AccordionCard>

      <AccordionCard
        title="Pest & Predator Reference"
        subtitle="Unwanted hitchhikers & disease guide"
        badge={`${mockPestReferences.length} entries`}>
        {mockPestReferences.map((pest, index) => (
          <View
            key={pest.id}
            style={[styles.row, index < mockPestReferences.length - 1 && styles.rowBorder]}>
            <View style={styles.rowHeader}>
              <Text style={styles.rowTitle}>{pest.name}</Text>
              <View
                style={[
                  styles.threatBadge,
                  { borderColor: `${getThreatColor(pest.threatLevel)}50` },
                ]}>
                <Text style={[styles.threatText, { color: getThreatColor(pest.threatLevel) }]}>
                  {pest.threatLevel.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.description}>{pest.description}</Text>
            <View style={styles.actionBox}>
              <Text style={styles.actionLabel}>Recommended Action</Text>
              <Text style={styles.actionText}>{pest.action}</Text>
            </View>
          </View>
        ))}
      </AccordionCard>

      {/* Add Inhabitant Modal */}
      <Modal
        visible={isInhabitantModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsInhabitantModalOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setIsInhabitantModalOpen(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Inhabitant</Text>
              <Pressable
                onPress={() => setIsInhabitantModalOpen(false)}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
                <X color={Theme.textMuted} size={18} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ gap: 14 }} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>COMMON NAME</Text>
                <TextInput
                  style={styles.input}
                  value={inhabitantName}
                  onChangeText={setInhabitantName}
                  placeholder="e.g. Neon Tetra"
                  placeholderTextColor={Theme.textDim}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>SPECIES (SCIENTIFIC NAME)</Text>
                <TextInput
                  style={styles.input}
                  value={inhabitantSpecies}
                  onChangeText={setInhabitantSpecies}
                  placeholder="e.g. Paracheirodon innesi"
                  placeholderTextColor={Theme.textDim}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>QUANTITY</Text>
                <TextInput
                  style={styles.input}
                  value={inhabitantCount}
                  onChangeText={setInhabitantCount}
                  placeholder="e.g. 6"
                  placeholderTextColor={Theme.textDim}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>TEMPERAMENT</Text>
                <View style={styles.radioGroup}>
                  {(['peaceful', 'semi-aggressive', 'aggressive'] as const).map((temp) => {
                    const active = inhabitantTemperament === temp;
                    return (
                      <Pressable
                        key={temp}
                        onPress={() => setInhabitantTemperament(temp)}
                        style={[
                          styles.radioBtn,
                          active && styles.radioBtnActive,
                          active && { borderColor: getTemperamentColor(temp) },
                        ]}>
                        <Text
                          style={[
                            styles.radioBtnText,
                            active && { color: getTemperamentColor(temp), fontWeight: '700' },
                          ]}>
                          {temp}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>NOTES</Text>
                <TextInput
                  style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
                  value={inhabitantNotes}
                  onChangeText={setInhabitantNotes}
                  placeholder="e.g. Schooling fish, prefers low pH"
                  placeholderTextColor={Theme.textDim}
                  multiline
                />
              </View>

              <Pressable
                onPress={handleAddInhabitant}
                style={({ pressed }) => [
                  styles.saveButton,
                  (!inhabitantName.trim() || !inhabitantSpecies.trim()) && styles.saveButtonDisabled,
                  pressed && styles.pressed,
                ]}
                disabled={!inhabitantName.trim() || !inhabitantSpecies.trim()}>
                <Check color={Theme.background} size={18} strokeWidth={2.5} />
                <Text style={styles.saveButtonText}>Add to Directory</Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Water Parameter Modal */}
      <Modal
        visible={isWaterModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsWaterModalOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setIsWaterModalOpen(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update {selectedParam?.name}</Text>
              <Pressable
                onPress={() => setIsWaterModalOpen(false)}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
                <X color={Theme.textMuted} size={18} />
              </Pressable>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>
                CURRENT READING ({selectedParam?.unit || 'value'})
              </Text>
              <TextInput
                style={styles.input}
                value={waterValue}
                onChangeText={setWaterValue}
                placeholder={`Current: ${selectedParam?.current}`}
                placeholderTextColor={Theme.textDim}
                keyboardType="numeric"
                autoFocus
              />
              <Text style={styles.rangeText}>
                Ideal Target: {selectedParam?.idealMin}
                {selectedParam?.idealMin !== selectedParam?.idealMax ? ` – ${selectedParam?.idealMax}` : ''}
                {selectedParam?.unit}
              </Text>
            </View>

            <Pressable
              onPress={handleUpdateWater}
              style={({ pressed }) => [
                styles.saveButton,
                !waterValue.trim() && styles.saveButtonDisabled,
                pressed && styles.pressed,
              ]}
              disabled={!waterValue.trim()}>
              <Check color={Theme.background} size={18} strokeWidth={2.5} />
              <Text style={styles.saveButtonText}>Update Parameter</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
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
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Theme.text,
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 14,
    color: Theme.textMuted,
    lineHeight: 20,
    marginBottom: 20,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(168, 85, 247, 0.08)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(168, 85, 247, 0.3)',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.accent,
  },
  row: {
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.tabBarBorder,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 8,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.text,
    flexWrap: 'wrap',
  },
  species: {
    fontSize: 12,
    fontStyle: 'italic',
    color: Theme.textDim,
    marginTop: 2,
  },
  countControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  adjustCountBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: Theme.background,
    borderWidth: 1,
    borderColor: Theme.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteInhabitantBtn: {
    padding: 6,
    marginLeft: 6,
  },
  countBadge: {
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Theme.glassBorder,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.accent,
  },
  tagRow: {
    flexDirection: 'row',
    marginBottom: 8,
    marginTop: 4,
  },
  tag: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  notes: {
    fontSize: 13,
    color: Theme.textMuted,
    lineHeight: 18,
    marginTop: 4,
  },
  paramRow: {
    paddingVertical: 14,
    borderRadius: 12,
    paddingHorizontal: 6,
  },
  pressedRow: {
    backgroundColor: 'rgba(168, 85, 247, 0.04)',
  },
  paramHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  paramValues: {
    flexDirection: 'row',
    backgroundColor: Theme.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.tabBarBorder,
    overflow: 'hidden',
  },
  paramBlock: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  paramDivider: {
    width: 1,
    backgroundColor: Theme.tabBarBorder,
  },
  paramLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Theme.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  paramValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Theme.accent,
  },
  paramRange: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.textMuted,
  },
  threatBadge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  threatText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 13,
    color: Theme.textMuted,
    lineHeight: 19,
    marginBottom: 10,
  },
  actionBox: {
    backgroundColor: 'rgba(168, 85, 247, 0.06)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Theme.glassBorder,
    padding: 12,
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Theme.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 13,
    color: Theme.text,
    lineHeight: 18,
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
  radioGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  radioBtn: {
    flex: 1,
    backgroundColor: Theme.background,
    borderWidth: 1,
    borderColor: Theme.glassBorder,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  radioBtnActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.08)',
  },
  radioBtnText: {
    fontSize: 12,
    color: Theme.textMuted,
    textTransform: 'capitalize',
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
  rangeText: {
    fontSize: 12,
    color: Theme.textMuted,
    marginTop: 8,
    fontStyle: 'italic',
  },
  pressed: {
    opacity: 0.8,
  },
});
