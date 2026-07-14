import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu } from 'lucide-react-native';

import Theme from '@/constants/Theme';
import { useDrawer } from '@/contexts/DrawerContext';

type AppHeaderProps = {
  title: string;
};

export default function AppHeader({ title }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const { openDrawer } = useDrawer();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Pressable
        onPress={openDrawer}
        style={({ pressed }) => [styles.menuButton, pressed && styles.menuButtonPressed]}
        hitSlop={8}>
        <Menu color={Theme.accent} size={24} strokeWidth={2.5} />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.background,
    borderBottomWidth: 1,
    borderBottomColor: Theme.tabBarBorder,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Theme.glass,
    borderWidth: 1,
    borderColor: Theme.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonPressed: {
    opacity: 0.7,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: Theme.text,
    letterSpacing: 0.3,
  },
  spacer: {
    width: 40,
  },
});
