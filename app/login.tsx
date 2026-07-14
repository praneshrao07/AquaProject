import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mail } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

import GlassCard from '@/components/GlassCard';
import Theme from '@/constants/Theme';
import { useAuth } from '@/contexts/AuthContext';

function GoogleIcon() {
  return (
    <View style={styles.googleIcon}>
      <Text style={styles.googleG}>G</Text>
    </View>
  );
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signInWithGoogle, signInWithEmail } = useAuth();

  const handleGoogleSignIn = () => {
    signInWithGoogle();
    router.replace('/(tabs)');
  };

  const handleEmailSignIn = () => {
    signInWithEmail();
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar style="light" />

      <View style={styles.glowOrbTop} />
      <View style={styles.glowOrbBottom} />

      <View style={styles.content}>
        <View style={styles.brandSection}>
          <View style={styles.logoRing}>
            <View style={styles.logoCore} />
          </View>
          <Text style={styles.appName}>AquaProject</Text>
          <Text style={styles.tagline}>Deep obsidian. Neon clarity.</Text>
        </View>

        <GlassCard glow style={styles.authCard}>
          <Text style={styles.welcomeTitle}>Welcome back</Text>
          <Text style={styles.welcomeSubtitle}>
            Sign in to continue. Authentication is mocked locally — no server required.
          </Text>

          <Pressable
            onPress={handleGoogleSignIn}
            style={({ pressed }) => [styles.signInButton, pressed && styles.buttonPressed]}>
            <GoogleIcon />
            <Text style={styles.signInButtonText}>Continue with Google</Text>
          </Pressable>

          <Pressable
            onPress={handleEmailSignIn}
            style={({ pressed }) => [
              styles.signInButton,
              styles.emailButton,
              pressed && styles.buttonPressed,
            ]}>
            <Mail color={Theme.accent} size={20} strokeWidth={2} />
            <Text style={[styles.signInButtonText, styles.emailButtonText]}>
              Continue with Email
            </Text>
          </Pressable>
        </GlassCard>

        <Text style={styles.footerNote}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background,
  },
  glowOrbTop: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: Theme.accent,
    opacity: 0.12,
  },
  glowOrbBottom: {
    position: 'absolute',
    bottom: 100,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Theme.accent,
    opacity: 0.08,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: Theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: Theme.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  logoCore: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.accent,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: Theme.text,
    letterSpacing: 1,
  },
  tagline: {
    marginTop: 8,
    fontSize: 14,
    color: Theme.textMuted,
    letterSpacing: 0.5,
  },
  authCard: {
    gap: 16,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Theme.text,
  },
  welcomeSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.textMuted,
    marginBottom: 8,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: Theme.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Theme.glassBorder,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  emailButton: {
    borderColor: Theme.accent,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.text,
  },
  emailButtonText: {
    color: Theme.accent,
  },
  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4285F4',
  },
  footerNote: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    color: Theme.textDim,
    paddingHorizontal: 16,
  },
});
