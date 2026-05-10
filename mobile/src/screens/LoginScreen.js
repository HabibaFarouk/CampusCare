import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { colors } from '../theme'; // Using your TA's existing theme file!

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Bring in the login function from our AuthContext
  const { login } = useAuth();

  const handleLogin = async () => {
    // Basic validation
    if (!email || !password) {
      Alert.alert('Hold on', 'Please enter both your email and password.');
      return;
    }

    setIsLoggingIn(true);
    
    // Call the backend
    const result = await login(email.trim(), password);
    
    setIsLoggingIn(false);

    if (!result.success) {
      // Show the exact error message from your Node.js backend!
      Alert.alert('Login Failed', result.error);
    }
    // Note: We don't need a success navigation here! 
    // App.js is watching the "user" state and will switch screens automatically.
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>CampusCare</Text>
      <Text style={styles.subHeader}>Please log in to continue</Text>

      <View style={styles.formCard}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. admin@test.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin}
          disabled={isLoggingIn}
        >
          {isLoggingIn ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Log In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.switchButton} 
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.switchButtonText}>Don't have an account? Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg || '#F5F7FA', // Fallback colors just in case
    justifyContent: 'center',
    padding: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary || '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 16,
    color: colors.textSubtle || '#7F8C8D',
    textAlign: 'center',
    marginBottom: 40,
  },
  formCard: {
    backgroundColor: colors.surface || '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text || '#34495E',
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.bg || '#F8F9FA',
    borderWidth: 1,
    borderColor: colors.border || '#E0E6ED',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
    color: colors.text || '#2C3E50',
  },
  loginButton: {
    backgroundColor: colors.primary || '#3498DB',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchButtonText: {
    color: colors.primary || '#3498DB',
    fontSize: 14,
    fontWeight: '500',
  },
});