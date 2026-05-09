import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { useAuthStore } from '../../store/authStore';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  return (
    <StyledView className="flex-1 items-center bg-gray-100 p-8">
      <StyledText className="text-3xl font-bold mt-12 mb-4">Profile</StyledText>
      <StyledText className="text-lg mb-8">
        {user?.firstName} {user?.lastName}
      </StyledText>
      <StyledText className="text-lg mb-8">{user?.email}</StyledText>

      <StyledTouchableOpacity
        className="w-full bg-red-500 rounded-lg py-4 mt-auto"
        onPress={logout}
      >
        <StyledText className="text-center text-white font-bold text-lg">
          Logout
        </StyledText>
      </StyledTouchableOpacity>
    </StyledView>
  );
}
