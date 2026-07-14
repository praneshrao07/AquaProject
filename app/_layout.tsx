import { useFonts } from 'expo-font';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/contexts/AuthContext';
import { DrawerProvider } from '@/contexts/DrawerContext';
import Theme from '@/constants/Theme';
import useProtectedRoute from '@/hooks/useProtectedRoute';

export { ErrorBoundary } from 'expo-router';

const ObsidianTheme = {
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
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <DrawerProvider>
        <ThemeProvider value={ObsidianTheme}>
          <StatusBar style="light" />
          <RootLayoutNav />
        </ThemeProvider>
      </DrawerProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  useProtectedRoute();

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Theme.background } }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
