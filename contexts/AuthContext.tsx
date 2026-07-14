import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  provider: 'google' | 'email';
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  signInWithGoogle: () => void;
  signInWithEmail: () => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading] = useState(false);

  const signInWithGoogle = useCallback(() => {
    setUser({
      id: 'mock-google-1',
      name: 'Obsidian User',
      email: 'user@gmail.com',
      provider: 'google',
    });
  }, []);

  const signInWithEmail = useCallback(() => {
    setUser({
      id: 'mock-email-1',
      name: 'Obsidian User',
      email: 'user@example.com',
      provider: 'email',
    });
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      signInWithGoogle,
      signInWithEmail,
      signOut,
    }),
    [user, isLoading, signInWithGoogle, signInWithEmail, signOut],
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
