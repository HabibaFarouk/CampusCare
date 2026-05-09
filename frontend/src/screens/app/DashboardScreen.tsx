import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { styled } from 'nativewind';
import { useAuthStore } from '../../store/authStore';
import ManagerDashboard from '../../components/dashboard/ManagerDashboard';

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);

const WelcomeScreen: React.FC = () => {
    const { user } = useAuthStore();
    return (
        <StyledView className="flex-1 justify-center items-center bg-gray-100 p-4">
            <StyledText className="text-3xl font-bold text-gray-800">Welcome,</StyledText>
            <StyledText className="text-2xl text-blue-600">{user?.firstName}!</StyledText>
            <StyledText className="text-center mt-4 text-gray-600">
                You can report new issues from the 'Issues' tab.
            </StyledText>
        </StyledView>
    );
};

export default function DashboardScreen() {
  const { user } = useAuthStore();

  const isManagerOrAdmin = user?.role === 'FACILITY_MANAGER' || user?.role === 'ADMIN';

  return (
    <StyledSafeAreaView className="flex-1">
      {isManagerOrAdmin ? <ManagerDashboard /> : <WelcomeScreen />}
    </StyledSafeAreaView>
  );
}
