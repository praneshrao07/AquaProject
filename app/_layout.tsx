import { useFonts } from 'expo-font';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, Platform } from 'react-native';
import 'react-native-reanimated';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AquariumDataProvider } from '@/contexts/AquariumDataContext';
import { DrawerProvider } from '@/contexts/DrawerContext';
import Theme from '@/constants/Theme';
import useProtectedRoute from '@/hooks/useProtectedRoute';

export { ErrorBoundary } from 'expo-router';

const AquaTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Theme.accent,
    background: Theme.background,
    card: Theme.glass,
    text: Theme.text,
    border: Theme.glassBorder,
    notification: Theme.accent,
  },
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    async function configureNotifications() {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('alarm-vibration-channel-v3', {
          name: 'High Priority Alerts',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 1000, 500, 1000, 500, 1000, 500, 1000],
          lightColor: '#A855F7',
          bypassDnd: true,
          enableVibrate: true,
          audioAttributes: {
            usage: Notifications.AndroidAudioUsage.ALARM,
            contentType: Notifications.AndroidAudioContentType.SONIFICATION,
          },
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // Check exact alarms permission for Android 12+ (API 31+)
      if (Platform.OS === 'android') {
        try {
          // console.log('Checking SCHEDULE_EXACT_ALARM permission settings...');
          if (finalStatus !== 'granted') {
            // console.warn('Notification permissions are not granted, exact alarms might fail to show alerts.');
          }
        } catch (e) {
          // console.warn('Failed to verify exact alarm rights:', e);
        }
      }

      // Register alarm category and button actions
      try {
        await Notifications.setNotificationCategoryAsync('timer-alarm', [
          {
            identifier: 'dismiss-alarm',
            buttonTitle: 'Dismiss Alarm',
            options: {
              opensAppToForeground: false,
              isDestructive: true,
            },
          },
        ]);
      } catch (e) {
        console.error('Failed to set notification categories:', e);
      }
    }
    configureNotifications();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <AquariumDataProvider>
        <DrawerProvider>
          <ThemeProvider value={AquaTheme}>
            <StatusBar style="light" />
            <RootLayoutNav fontsLoaded={loaded} />
          </ThemeProvider>
        </DrawerProvider>
      </AquariumDataProvider>
    </AuthProvider>
  );
}

function RootLayoutNav({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { isLoading } = useAuth();

  useEffect(() => {
    if (fontsLoaded && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoading]);

  // Guard the routes until the storage session has resolved
  useProtectedRoute();

  if (isLoading || !fontsLoaded) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Theme.background } }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}