import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
} from 'react-native';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
// 1. Import the useAuth hook from your context!
import { useAuth } from '../../auth/AuthContext'; 

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 2. Extract the login function from the context
  const { login } = useAuth(); 

  const handleLogin = async () => {
    // 3. Use the correct state variables (email and password, not formData)
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      
      // 4. Pass the correct variables to the context login function
      const result = await login(email, password);
      
      // 5. Show the error if it fails
      if (!result.success) {
        Alert.alert('Login Failed', result.error || 'Invalid email or password');
      }
      
    } catch (error) {
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
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>CampusCare</Text>
            <Text style={styles.subtitle}>Issue Management System</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              secureTextEntry
            />

            <Button
              title="Login"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
            />

            <View style={styles.forgotPasswordContainer}>
              <Button
                title="Forgot Password?"
                onPress={() => navigation.navigate('ForgotPassword')}
                variant="text"
                size="sm"
              />
            </View>

            <View style={styles.footerLinks}>
              <Button
                title="Don't have an account? Sign Up"
                onPress={() => navigation.navigate('Register')}
                variant="secondary"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#007AFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  loginButton: {
    marginTop: 20,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  footerLinks: {
    marginTop: 16,
  },
});

export default LoginScreen;