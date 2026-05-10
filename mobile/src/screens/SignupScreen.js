import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { useAuth } from '../auth/AuthContext';
import { colors, spacing, radius, type } from '../theme';

export default function SignupScreen({ navigation }) {
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState(null);

  async function handleSignup() {
    if (!email || !password) {
      Alert.alert('Missing info', 'Please enter email and password.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Use at least 6 characters.');
      return;
    }
    try {
      setSubmitting(true);
      await signup(email.trim(), password);
    } catch (err) {
      Alert.alert('Signup failed', err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <View style={styles.brand}>
          <Text style={styles.brandEmoji}>✨</Text>
        </View>

        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Save your memories forever.</Text>

        <TextInput
          style={[styles.input, focused === 'email' && styles.inputFocused]}
          placeholder="Email"
          placeholderTextColor={colors.textSubtle}
          value={email}
          onChangeText={setEmail}
          onFocus={() => setFocused('email')}
          onBlur={() => setFocused(null)}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />

        <TextInput
          style={[styles.input, focused === 'password' && styles.inputFocused]}
          placeholder="Password (min 6 chars)"
          placeholderTextColor={colors.textSubtle}
          value={password}
          onChangeText={setPassword}
          onFocus={() => setFocused('password')}
          onBlur={() => setFocused(null)}
          secureTextEntry
        />

        <Pressable
          onPress={handleSignup}
          disabled={submitting}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
            submitting && styles.disabled,
          ]}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Sign up</Text>
          )}
        </Pressable>

        <Pressable onPress={() => navigation.goBack()} style={styles.linkRow}>
          <Text style={styles.linkMuted}>Already have an account? </Text>
          <Text style={styles.link}>Log in</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner: { flex: 1, padding: spacing.xl, justifyContent: 'center' },
  brand: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  brandEmoji: { fontSize: 36 },
  title: { ...type.display, marginBottom: spacing.sm },
  subtitle: { ...type.bodyMuted, marginBottom: spacing.xl },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.6 },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  linkMuted: { ...type.small },
  link: { ...type.small, color: colors.primary, fontWeight: '600' },
});
