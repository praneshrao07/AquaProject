import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import CountdownCard from '@/components/home/CountdownCard';
import QuickActionToggle from '@/components/home/QuickActionToggle';
import TopographicHero from '@/components/home/TopographicHero';
import Theme from '@/constants/Theme';
import {
  initialQuickActions,
  mockCountdowns,
  mockTank,
} from '@/data/mockAquariumData';
import type { QuickAction } from '@/types/aquarium';

export default function HomeScreen() {
  const [quickActions, setQuickActions] = useState<QuickAction[]>(initialQuickActions);

  const handleToggle = useCallback((id: string, enabled: boolean) => {
    setQuickActions((prev) =>
      prev.map((action) => (action.id === id ? { ...action, enabled } : action)),
    );
  }, []);

  return (
    <View style={styles.container}>
      <TopographicHero tank={mockTank} />

      <ScrollView
        style={styles.bottom}
        contentContainerStyle={styles.bottomContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>LIVE COUNTDOWNS</Text>
        <View style={styles.countdownRow}>
          {mockCountdowns.map((event) => (
            <CountdownCard key={event.id} event={event} />
          ))}
        </View>

        <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <QuickActionToggle key={action.id} action={action} onToggle={handleToggle} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background,
  },
  bottom: {
    flex: 1,
  },
  bottomContent: {
    padding: 16,
    paddingBottom: 24,
    gap: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: Theme.textDim,
    marginTop: 4,
  },
  countdownRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
