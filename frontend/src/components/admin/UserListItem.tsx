import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { User } from '../../types/admin';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface UserListItemProps {
  user: User;
  onPress: () => void;
}

const roleColors: { [key: string]: string } = {
  ADMIN: 'bg-purple-200 text-purple-800',
  FACILITY_MANAGER: 'bg-blue-200 text-blue-800',
  WORKER: 'bg-yellow-200 text-yellow-800',
  COMMUNITY_MEMBER: 'bg-green-200 text-green-800',
};

const UserListItem: React.FC<UserListItemProps> = ({ user, onPress }) => {
  const roleStyle = roleColors[user.role] || 'bg-gray-200 text-gray-800';

  return (
    <StyledTouchableOpacity
      onPress={onPress}
      className="bg-white p-4 rounded-lg shadow-md mb-4"
    >
      <StyledView className="flex-row justify-between items-center">
        <StyledView>
          <StyledText className="text-lg font-bold text-gray-800">
            {user.firstName} {user.lastName}
          </StyledText>
          <StyledText className="text-gray-600">{user.email}</StyledText>
        </StyledView>
        <StyledView className={`px-3 py-1 rounded-full ${roleStyle.split(' ')[0]}`}>
          <StyledText className={`text-xs font-semibold ${roleStyle.split(' ')[1]}`}>
            {user.role.replace('_', ' ')}
          </StyledText>
        </StyledView>
      </StyledView>
    </StyledTouchableOpacity>
  );
};

export default UserListItem;
