import React, { useEffect, useState } from 'react';
import { SafeAreaView, FlatList, View, Text, ActivityIndicator, RefreshControl } from 'react-native';
import { styled } from 'nativewind';
import { useAdminStore } from '../../store/adminStore';
import UserListItem from '../../components/admin/UserListItem';
import UserManagementModal from '../../components/admin/UserManagementModal';
import { User } from '../../types/admin';

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);

export default function AdminScreen() {
  const { users, isLoading, error, fetchAllUsers } = useAdminStore();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  const handleUserPress = (user: User) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedUser(null);
  };

  if (isLoading && users.length === 0) {
    return (
      <StyledView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </StyledView>
    );
  }

  return (
    <StyledSafeAreaView className="flex-1 bg-gray-100">
      <StyledView className="p-4 border-b border-gray-200 bg-white">
        <StyledText className="text-2xl font-bold text-center">User Management</StyledText>
      </StyledView>

      {error && (
        <StyledView className="p-4 bg-red-100">
          <StyledText className="text-red-700 text-center">{error}</StyledText>
        </StyledView>
      )}

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <UserListItem user={item} onPress={() => handleUserPress(item)} />}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchAllUsers} />}
      />

      <UserManagementModal
        user={selectedUser}
        visible={isModalVisible}
        onClose={handleCloseModal}
      />
    </StyledSafeAreaView>
  );
}
