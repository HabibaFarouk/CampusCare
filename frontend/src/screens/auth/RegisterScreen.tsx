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
import { UserRole } from '../../types/auth';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function RegisterScreen({ navigation }: AuthStackScreenProps<'Register'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleRegister = async () => {
    if (!email || !password || !firstName || !lastName) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setIsLoading(true);
    try {
      const { user, token } = await authService.register({
        email,
        password,
        firstName,
        lastName,
        role: 'COMMUNITY_MEMBER', // Default role for new registrations
      });
      await setAuth(user, token);
      // Navigation to App stack is automatic
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Registration failed. Please try again.';
      Alert.alert('Registration Failed', errorMessage);
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
          <StyledText className="text-4xl font-bold text-blue-600 mb-8">
            Create Account
          </StyledText>

          <StyledTextInput
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 mb-4 text-lg"
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
          />

          <StyledTextInput
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 mb-4 text-lg"
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
          />

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
              onPress={handleRegister}
            >
              <StyledText className="text-center text-white font-bold text-lg">
                Register
              </StyledText>
            </StyledTouchableOpacity>
          )}

          <StyledTouchableOpacity
            className="mt-6"
            onPress={() => navigation.navigate('Login')}
          >
            <StyledText className="text-blue-600">
              Already have an account? Login
            </StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
