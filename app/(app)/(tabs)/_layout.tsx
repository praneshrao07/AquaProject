import { Tabs } from 'expo-router';
import { Bell, Home, Info, Users } from 'lucide-react-native';
import { View } from 'react-native';

import AppHeader from '@/components/AppHeader';
import DrawerMenu from '@/components/DrawerMenu';
import Theme from '@/constants/Theme';

const TAB_CONFIG = [
  { name: 'index', title: 'Home', icon: Home },
  { name: 'reminders', title: 'Reminders', icon: Bell },
  { name: 'info', title: 'Info', icon: Info },
  { name: 'community', title: 'Community', icon: Users },
] as const;

export default function TabLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          header: ({ options }) => <AppHeader title={options.title ?? ''} />,
          tabBarActiveTintColor: Theme.accent,
          tabBarInactiveTintColor: Theme.textDim,
          tabBarStyle: {
            backgroundColor: Theme.tabBarBackground,
            borderTopColor: Theme.tabBarBorder,
            borderTopWidth: 1,
            height: 64,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            letterSpacing: 0.3,
          },
          sceneStyle: {
            backgroundColor: Theme.background,
          },
        }}>
        {TAB_CONFIG.map(({ name, title, icon: Icon }) => (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              title,
              tabBarIcon: ({ color, focused }) => (
                <View
                  style={
                    focused
                      ? {
                          backgroundColor: 'rgba(168, 85, 247, 0.15)',
                          borderRadius: 12,
                          padding: 6,
                        }
                      : undefined
                  }>
                  <Icon color={color} size={22} strokeWidth={focused ? 2.5 : 2} />
                </View>
              ),
            }}
          />
        ))}
      </Tabs>
      <DrawerMenu />
    </>
  );
}
