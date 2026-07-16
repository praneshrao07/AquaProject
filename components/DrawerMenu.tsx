import { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bell,
  Home,
  Info,
  LogOut,
  Users,
  X,
} from 'lucide-react-native';

import Theme from '@/constants/Theme';
import { useAuth } from '@/contexts/AuthContext';
import { useDrawer } from '@/contexts/DrawerContext';

const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Reminders', href: '/reminders', icon: Bell },
  { label: 'Info', href: '/info', icon: Info },
  { label: 'Community', href: '/community', icon: Users },
] as const;

export default function DrawerMenu() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen, closeDrawer } = useDrawer();
  const { user, signOut } = useAuth();
  const slideAnim = useRef(new Animated.Value(-320)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? 0 : -320,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isOpen, slideAnim]);

  const handleNavigate = (href: (typeof NAV_ITEMS)[number]['href']) => {
    closeDrawer();
    router.push(href);
  };

  const handleLogout = () => {
    closeDrawer();
    signOut();
    router.replace('/login');
  };

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <Modal visible={isOpen} transparent animationType="none" onRequestClose={closeDrawer}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={closeDrawer} />
        <Animated.View
          style={[
            styles.drawer,
            { paddingTop: insets.top + 16, transform: [{ translateX: slideAnim }] },
          ]}>
          <View style={styles.drawerHeader}>
            <View>
              <Text style={styles.drawerTitle}>AquaProject</Text>
              {user && <Text style={styles.drawerSubtitle}>{user.email}</Text>}
            </View>
            <Pressable
              onPress={closeDrawer}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
              <X color={Theme.textMuted} size={20} />
            </Pressable>
          </View>

          <View style={styles.navSection}>
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Pressable
                  key={href}
                  onPress={() => handleNavigate(href)}
                  style={({ pressed }) => [
                    styles.navItem,
                    active && styles.navItemActive,
                    pressed && styles.pressed,
                  ]}>
                  <Icon
                    color={active ? Theme.accent : Theme.textMuted}
                    size={22}
                    strokeWidth={2}
                  />
                  <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.footer}>
            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}>
              <LogOut color={Theme.danger} size={20} strokeWidth={2} />
              <Text style={styles.logoutLabel}>Logout</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: Theme.overlay,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 300,
    backgroundColor: Theme.glass,
    borderRightWidth: 1,
    borderRightColor: Theme.glassBorder,
    paddingHorizontal: 20,
    shadowColor: Theme.accent,
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Theme.tabBarBorder,
  },
  drawerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Theme.text,
    letterSpacing: 0.5,
  },
  drawerSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: Theme.textMuted,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Theme.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navSection: {
    gap: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderWidth: 1,
    borderColor: Theme.glassBorder,
  },
  navLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Theme.textMuted,
  },
  navLabelActive: {
    color: Theme.accent,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  logoutLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.danger,
  },
  pressed: {
    opacity: 0.7,
  },
});
