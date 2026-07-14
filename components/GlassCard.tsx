import { StyleSheet, View, type ViewProps } from 'react-native';

import Theme from '@/constants/Theme';

type GlassCardProps = ViewProps & {
  glow?: boolean;
};

export default function GlassCard({ style, glow = false, children, ...props }: GlassCardProps) {
  return (
    <View
      style={[
        styles.card,
        glow && styles.glow,
        style,
      ]}
      {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.glass,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Theme.glassBorder,
    padding: 20,
  },
  glow: {
    shadowColor: Theme.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
});
