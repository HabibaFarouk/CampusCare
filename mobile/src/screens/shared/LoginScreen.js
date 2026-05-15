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
  Image,
} from 'react-native';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { colors, type } from '../../theme';
import { useAuth } from '../../auth/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const result = await login(email.trim(), password);
      if (!result.success) {
        Alert.alert('Login Failed', result.error || 'Invalid email or password.');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong connecting to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <ScrollView contentContainerStyle={styles.scrollView} keyboardShouldPersistTaps="handled">
        {/* Hero header */}
        <View style={styles.hero}>
          <Image 
            source={require('../../../assets/Logo.png')} 
            style={styles.logo} 
            resizeMode="contain" 
          />
          <Text style={styles.appName}>CampusCare</Text>
          <Text style={styles.tagline}>German International University</Text>
        </View>

        {/* Form card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome back</Text>
          <Text style={styles.cardSubtitle}>Sign in to your account</Text>

          <Input
            label="Email"
            placeholder="you@university.edu"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.forgotRow}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            variant="action"
            style={styles.signInButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.signUpRow}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.signUpText}>
              Don't have an account?{'  '}
              <Text style={styles.signUpLink}>Create one</Text>
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
    backgroundColor: colors.bg,
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
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  appName: {
    ...type.title,
    fontSize: 28,
  },
  tagline: {
    ...type.small,
    marginTop: 4,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    minHeight: 460,
  },
  cardTitle: {
    fontSize: 32,
    fontFamily: 'serif',
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    ...type.bodyMuted,
    marginBottom: 28,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: 4,
    marginBottom: 8,
    paddingVertical: 4,
  },
  forgotText: {
    fontSize: 13,
    color: colors.action,
    fontWeight: '600',
  },
  signInButton: {
    marginTop: 12,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 12,
    color: colors.textSubtle,
    marginHorizontal: 12,
    fontWeight: '600',
  },
  signUpRow: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  signUpText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  signUpLink: {
    color: colors.action,
    fontWeight: '700',
  },
});

export default LoginScreen;
