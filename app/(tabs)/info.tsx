import { ScrollView, StyleSheet, Text, View } from 'react-native';

import AccordionCard from '@/components/AccordionCard';
import Theme from '@/constants/Theme';
import {
  mockInhabitants,
  mockPestReferences,
  mockWaterParameters,
} from '@/data/mockAquariumData';
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
        badge={`${mockInhabitants.length} species`}
        defaultOpen>
        {mockInhabitants.map((inhabitant, index) => (
          <View
            key={inhabitant.id}
            style={[styles.row, index < mockInhabitants.length - 1 && styles.rowBorder]}>
            <View style={styles.rowHeader}>
              <Text style={styles.rowTitle}>{inhabitant.name}</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>×{inhabitant.count}</Text>
              </View>
            </View>
            <Text style={styles.species}>{inhabitant.species}</Text>
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
            <Text style={styles.notes}>{inhabitant.notes}</Text>
          </View>
        ))}
      </AccordionCard>

      <AccordionCard
        title="Water Thresholds"
        subtitle="Ideal ranges vs. current readings"
        badge="Live">
        {mockWaterParameters.map((param, index) => {
          const status = getParameterStatus(param);
          const rangeLabel =
            param.idealMin === param.idealMax
              ? `${param.idealMin}${param.unit}`
              : `${param.idealMin}–${param.idealMax}${param.unit}`;

          return (
            <View
              key={param.id}
              style={[styles.paramRow, index < mockWaterParameters.length - 1 && styles.rowBorder]}>
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
            </View>
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
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.text,
    flex: 1,
    marginRight: 8,
  },
  species: {
    fontSize: 12,
    fontStyle: 'italic',
    color: Theme.textDim,
    marginBottom: 8,
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
  },
  paramRow: {
    paddingVertical: 14,
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
});
