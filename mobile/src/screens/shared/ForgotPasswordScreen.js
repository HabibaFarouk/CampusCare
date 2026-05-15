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
import client from '../../api/client';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('Missing Email', 'Please enter your email address.');
      return;
    }

    try {
      setLoading(true);
      await client.post('/auth/forgot-password', { email: email.trim() });
      setSubmitted(true);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to send reset email. Please try again.');
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
            <Text style={styles.logoIcon}>🔒</Text>
          </View>
          <Text style={styles.appName}>Reset Password</Text>
          <Text style={styles.tagline}>We'll send a link to your email</Text>
        </View>

        {/* Form card */}
        <View style={styles.card}>
          {!submitted ? (
            <>
              <Text style={styles.cardTitle}>Forgot your password?</Text>
              <Text style={styles.cardSubtitle}>
                Enter your account email and we'll send you a password reset link.
              </Text>

              <Input
                label="Email Address"
                placeholder="you@university.edu"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />

              <Button
                title="Send Reset Link"
                onPress={handleReset}
                loading={loading}
                style={styles.submitButton}
              />

              <TouchableOpacity
                style={styles.backRow}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backText}>← Back to Sign In</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.successContainer}>
              <View style={styles.successIconCircle}>
                <Text style={styles.successIconText}>✓</Text>
              </View>
              <Text style={styles.successTitle}>Check your inbox</Text>
              <Text style={styles.successMessage}>
                We've sent a password reset link to{'\n'}
                <Text style={styles.successEmail}>{email}</Text>
                {'\n\n'}Follow the instructions in the email to create a new password.
              </Text>
              <Button
                title="Back to Sign In"
                onPress={() => navigation.navigate('Login')}
                style={styles.backButton}
              />
            </View>
          )}
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
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoIcon: {
    fontSize: 38,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  tagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 6,
  },
  card: {
    flex: 1,
    backgroundColor: '#fcfaf8',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    minHeight: 380,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#8a8a9a',
    lineHeight: 20,
    marginBottom: 28,
  },
  submitButton: {
    marginTop: 16,
  },
  backRow: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 8,
  },
  backText: {
    fontSize: 14,
    color: '#1565C0',
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    paddingTop: 16,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successIconText: {
    fontSize: 36,
    color: '#2E7D32',
    fontWeight: '700',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 14,
    color: '#6b6b80',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  successEmail: {
    color: '#1565C0',
    fontWeight: '600',
  },
  backButton: {
    width: '100%',
  },
});

export default ForgotPasswordScreen;
