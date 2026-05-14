import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../auth/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useAuth();

  const set = (field) => (value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const result = await register(
        formData.name.trim(),
        formData.email.trim(),
        formData.password,
        'MEMBER'
      );

      if (!result.success) {
        Alert.alert('Registration Failed', result.error || 'Could not create account.');
        return;
      }
      // If backend returns token, AuthContext auto-logs in and navigation updates automatically.
      // If not, navigate to Login manually.
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1565C0" />
      <ScrollView contentContainerStyle={styles.scrollView} keyboardShouldPersistTaps="handled">
        {/* Hero header */}
        <View style={styles.hero}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>🏫</Text>
          </View>
          <Text style={styles.appName}>CampusCare</Text>
          <Text style={styles.tagline}>Join your campus community</Text>
        </View>

        {/* Form card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create account</Text>
          <Text style={styles.cardSubtitle}>Fill in your details to get started</Text>

          <Input
            label="Full Name"
            placeholder="Your full name"
            value={formData.name}
            onChangeText={set('name')}
            error={errors.name}
            autoCapitalize="words"
          />

          <Input
            label="Email"
            placeholder="you@university.edu"
            value={formData.email}
            onChangeText={set('email')}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Password"
            placeholder="At least 6 characters"
            value={formData.password}
            onChangeText={set('password')}
            error={errors.password}
            secureTextEntry
          />

          <Input
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChangeText={set('confirmPassword')}
            error={errors.confirmPassword}
            secureTextEntry
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            style={styles.createButton}
          />

          <TouchableOpacity
            style={styles.loginRow}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginText}>
              Already have an account?{'  '}
              <Text style={styles.loginLink}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1565C0',
  },
  scrollView: {
    flexGrow: 1,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  logoIcon: {
    fontSize: 34,
  },
  appName: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 6,
  },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#8a8a9a',
    marginBottom: 24,
  },
  createButton: {
    marginTop: 16,
  },
  loginRow: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 4,
  },
  loginText: {
    fontSize: 14,
    color: '#6b6b80',
  },
  loginLink: {
    color: '#1565C0',
    fontWeight: '700',
  },
});

export default RegisterScreen;
