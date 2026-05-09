import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Alert } from 'react-native';
import { styled } from 'nativewind';
import { User, UserRole } from '../../types/admin';
import { useAdminStore } from '../../store/adminStore';
import { Picker } from '@react-native-picker/picker';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface UserManagementModalProps {
  user: User | null;
  visible: boolean;
  onClose: () => void;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({ user, visible, onClose }) => {
  if (!user) return null;

  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const { updateUserRole, isLoading } = useAdminStore();

  const handleUpdateRole = async () => {
    if (selectedRole === user.role) {
      Alert.alert('No Change', 'The selected role is the same as the current role.');
      return;
    }
    try {
      await updateUserRole(user.id, selectedRole);
      Alert.alert('Success', `${user.firstName}'s role has been updated to ${selectedRole}.`);
      onClose();
    } catch (error: any) {
      Alert.alert('Update Failed', error.message);
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <StyledView className="flex-1 justify-center items-center bg-black/50">
        <StyledView className="w-11/12 bg-white rounded-lg p-6">
          <StyledText className="text-2xl font-bold mb-4">Manage User</StyledText>
          <StyledText className="text-lg font-semibold">{user.firstName} {user.lastName}</StyledText>
          <StyledText className="text-gray-600 mb-6">{user.email}</StyledText>

          <StyledText className="text-lg font-semibold mb-2">Change Role</StyledText>
          <StyledView className="border border-gray-300 rounded-lg mb-6">
            <Picker
              selectedValue={selectedRole}
              onValueChange={(itemValue) => setSelectedRole(itemValue as UserRole)}
            >
              <Picker.Item label="Community Member" value="COMMUNITY_MEMBER" />
              <Picker.Item label="Worker" value="WORKER" />
              <Picker.Item label="Facility Manager" value="FACILITY_MANAGER" />
              <Picker.Item label="Admin" value="ADMIN" />
            </Picker>
          </StyledView>

          <StyledTouchableOpacity
            className={`py-3 rounded-lg ${isLoading ? 'bg-gray-400' : 'bg-blue-600'}`}
            onPress={handleUpdateRole}
            disabled={isLoading}
          >
            <StyledText className="text-white text-center font-bold">Update Role</StyledText>
          </StyledTouchableOpacity>

          <StyledTouchableOpacity
            className="mt-3 py-3 bg-gray-200 rounded-lg"
            onPress={onClose}
          >
            <StyledText className="text-gray-800 text-center font-bold">Cancel</StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledView>
    </Modal>
  );
};

export default UserManagementModal;
