import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Text,
  ScrollView,
} from 'react-native';
import Button from '../../components/common/Button';
import adminApi from '../../api/adminApi';

const ROLE_FILTERS = ['ALL', 'MEMBER', 'WORKER', 'FACILITY_MANAGER', 'ADMIN'];
const ROLE_OPTIONS = ['MEMBER', 'WORKER', 'FACILITY_MANAGER', 'ADMIN'];

const UserMgmtScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUsers();
    });
    return unsubscribe;
  }, [navigation]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await adminApi.updateUserStatus(user.id, !user.isActive);
      loadUsers();
    } catch (error) {
      Alert.alert('Error', 'Failed to update user status');
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await adminApi.updateUserRole(userId, role);
      loadUsers();
    } catch (error) {
      Alert.alert('Error', 'Failed to update user role');
    }
  };

  const visibleUsers =
    filter === 'ALL' ? users : users.filter((user) => user.role === filter);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Management</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {ROLE_FILTERS.map((role) => (
          <Button
            key={role}
            title={role}
            onPress={() => setFilter(role)}
            variant={filter === role ? 'primary' : 'secondary'}
            size="sm"
            style={styles.filterButton}
          />
        ))}
      </ScrollView>

      {visibleUsers.length > 0 ? (
        <FlatList
          data={visibleUsers}
          renderItem={({ item }) => (
            <View style={styles.userItem}>
              <View style={styles.userHeader}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.userEmail}>{item.email}</Text>
                </View>
                <View style={styles.badgeGroup}>
                  <Text style={styles.roleBadge}>{item.role}</Text>
                  <Text
                    style={[
                      styles.statusBadge,
                      { backgroundColor: item.isActive ? '#34C759' : '#FF9500' },
                    ]}
                  >
                    {item.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </Text>
                </View>
              </View>

              <View style={styles.actionsRow}>
                <Button
                  title={item.isActive ? 'Deactivate' : 'Activate'}
                  onPress={() => handleToggleStatus(item)}
                  variant={item.isActive ? 'secondary' : 'primary'}
                  size="sm"
                />
              </View>

              <View style={styles.roleRow}>
                {ROLE_OPTIONS.map((role) => (
                  <Button
                    key={`${item.id}-${role}`}
                    title={role}
                    onPress={() => handleRoleChange(item.id, role)}
                    variant={item.role === role ? 'primary' : 'secondary'}
                    size="sm"
                    style={styles.roleButton}
                  />
                ))}
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No users found</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  filterContainer: {
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  filterContent: {
    paddingRight: 8,
  },
  filterButton: {
    marginRight: 8,
    minWidth: 130,
  },
  userItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
  },
  badgeGroup: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  roleBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 6,
  },
  statusBadge: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  actionsRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  roleButton: {
    marginRight: 8,
    marginBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default UserMgmtScreen;
