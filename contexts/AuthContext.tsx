import { createContext, useCallback, useContext, useMemo, useState, useEffect, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  provider: 'google' | 'email' | 'guest';
  isGuest?: boolean;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = '@aqua_project_user_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load the persistent session when the app launches
  useEffect(() => {
    async function loadStorageData() {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
          const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
          if (jsonValue != null) {
            setUser(JSON.parse(jsonValue));
          } else {
            // Reconstruct mock user if storage is empty but token exists
            const isGoogle = token.includes('google');
            const isGuest = token.includes('guest');
            const mockUser: AuthUser = {
              id: isGuest ? 'guest-user' : (isGoogle ? 'mock-google-1' : 'mock-email-1'),
              name: isGuest ? 'Guest User' : 'Aqua User',
              email: isGuest ? 'guest@example.com' : (isGoogle ? 'user@gmail.com' : 'user@example.com'),
              provider: isGuest ? 'guest' : (isGoogle ? 'google' : 'email'),
              isGuest: isGuest ? true : undefined,
            };
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
            setUser(mockUser);
          }
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error('Failed to load auth session:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadStorageData();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      const mockUser: AuthUser = {
        id: 'mock-google-1',
        name: 'Aqua User',
        email: 'user@gmail.com',
        provider: 'google',
      };
      await SecureStore.setItemAsync('userToken', 'mock-google-token-123');
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
      setUser(mockUser);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithEmail = useCallback(async () => {
    setIsLoading(true);
    try {
      const mockUser: AuthUser = {
        id: 'mock-email-1',
        name: 'Aqua User',
        email: 'user@example.com',
        provider: 'email',
      };
      await SecureStore.setItemAsync('userToken', 'mock-email-token-123');
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
      setUser(mockUser);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInAsGuest = useCallback(async () => {
    setIsLoading(true);
    try {
      const guestUser: AuthUser = {
        id: 'guest-user',
        name: 'Guest User',
        email: 'guest@example.com',
        provider: 'guest',
        isGuest: true,
      };
      await SecureStore.setItemAsync('userToken', 'guest-token-123');
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(guestUser));
      setUser(guestUser);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await SecureStore.deleteItemAsync('userToken');
      await AsyncStorage.removeItem(STORAGE_KEY);
      setUser(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      signInWithGoogle,
      signInWithEmail,
      signInAsGuest,
      signOut,
    }),
    [user, isLoading, signInWithGoogle, signInWithEmail, signInAsGuest, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}