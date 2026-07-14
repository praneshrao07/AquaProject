import { StyleSheet, Text, View } from 'react-native';
import { Lock, Shield } from 'lucide-react-native';

import GlassCard from '@/components/GlassCard';
import Theme from '@/constants/Theme';

export default function CommunityScreen() {
  return (
    <View style={styles.container}>
      <GlassCard glow style={styles.card}>
        <View style={styles.blurOverlay}>
          <View style={styles.iconStack}>
            <View style={styles.shieldBg}>
              <Shield color={Theme.accent} size={48} strokeWidth={1.5} opacity={0.3} />
            </View>
            <View style={styles.lockBadge}>
              <Lock color={Theme.text} size={28} strokeWidth={2.5} />
            </View>
          </View>

          <Text style={styles.lockedLabel}>LOCKED</Text>
          <Text style={styles.title}>Community & Local Trading Portal</Text>
          <Text style={styles.subtitle}>— Coming in the next free update!</Text>

          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• Local fish & plant trading board</Text>
            <Text style={styles.featureItem}>• Community tank showcases</Text>
            <Text style={styles.featureItem}>• Expert Q&A forums</Text>
          </View>

          <View style={styles.noServerBadge}>
            <Text style={styles.noServerText}>No server costs · 100% offline for now</Text>
          </View>
        </View>

        <View style={styles.decorLine} />
        <View style={styles.decorLine2} />
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    overflow: 'hidden',
    padding: 0,
    borderColor: Theme.accent,
    borderWidth: 1.5,
  },
  blurOverlay: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: 'rgba(26, 22, 37, 0.85)',
  },
  iconStack: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  shieldBg: {
    position: 'absolute',
    opacity: 0.6,
  },
  lockBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Theme.background,
    borderWidth: 2,
    borderColor: Theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Theme.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  lockedLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
    color: Theme.textDim,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Theme.text,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Theme.accent,
    textAlign: 'center',
    marginBottom: 24,
  },
  featureList: {
    alignSelf: 'stretch',
    gap: 8,
    marginBottom: 24,
  },
  featureItem: {
    fontSize: 13,
    color: Theme.textMuted,
    lineHeight: 20,
  },
  noServerBadge: {
    backgroundColor: Theme.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Theme.tabBarBorder,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  noServerText: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.textDim,
    textAlign: 'center',
  },
  decorLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Theme.accent,
    opacity: 0.4,
  },
  decorLine2: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 1,
    backgroundColor: Theme.accent,
    opacity: 0.2,
  },
});
