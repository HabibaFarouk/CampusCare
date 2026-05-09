import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { styled } from 'nativewind';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { AuthStackScreenProps } from '../../navigation/types';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function LoginScreen({ navigation }: AuthStackScreenProps<'Login'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    try {
      const { user, token } = await authService.login({ email, password });
      await setAuth(user, token);
      // Navigation to the App stack will be handled automatically by the RootNavigator
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Login failed. Please check your credentials.';
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <StyledView className="flex-1 justify-center items-center bg-gray-100 p-8">
          <StyledText className="text-4xl font-bold text-blue-600 mb-12">
            CampusCare
          </StyledText>

          <StyledTextInput
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 mb-4 text-lg"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <StyledTextInput
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 mb-6 text-lg"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {isLoading ? (
            <ActivityIndicator size="large" color="#3b82f6" />
          ) : (
            <StyledTouchableOpacity
              className="w-full bg-blue-600 rounded-lg py-4"
              onPress={handleLogin}
            >
              <StyledText className="text-center text-white font-bold text-lg">
                Login
              </StyledText>
            </StyledTouchableOpacity>
          )}

          <StyledView className="flex-row justify-between w-full mt-6">
            <StyledTouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <StyledText className="text-blue-600">Forgot Password?</StyledText>
            </StyledTouchableOpacity>
            <StyledTouchableOpacity onPress={() => navigation.navigate('Register')}>
              <StyledText className="text-blue-600">Create Account</StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
