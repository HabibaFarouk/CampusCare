import React from 'react';
import { View, Text } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);

interface KpiCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode; // Optional: for a small icon
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value }) => {
  return (
    <StyledView className="bg-white p-4 rounded-lg shadow-md items-center justify-center flex-1 m-2">
      <StyledText className="text-4xl font-bold text-blue-600">{value}</StyledText>
      <StyledText className="text-sm font-semibold text-gray-500 mt-1 text-center">{title}</StyledText>
    </StyledView>
  );
};

export default KpiCard;
