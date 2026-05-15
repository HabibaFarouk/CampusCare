import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Text,
  Switch,
} from 'react-native';
import adminApi from '../../api/adminApi';
import Dropdown from '../../components/common/Dropdown';
import DashboardHeader from '../../components/common/DashboardHeader';
import { colors, type, radius, spacing, shadow } from '../../theme';

const ROLE_LABELS = {
  MEMBER: 'Community\nMember',
  WORKER: 'Worker',
  FACILITY_MANAGER: 'Facility\nManager',
  ADMIN: 'System\nAdmin',
};

const UserMgmtScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const filteredUsers = filter === 'ALL' ? users : users.filter(u => u.role === filter);

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
      const message = error.response?.data?.error || error.message || 'Failed to load users';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      // Optimistic update
      setUsers(users.map(u => u.id === user.id ? { ...u, isActive: !user.isActive } : u));
      await adminApi.updateUserStatus(user.id, !user.isActive);
    } catch (error) {
      // Revert on error
      setUsers(users.map(u => u.id === user.id ? { ...u, isActive: user.isActive } : u));
      Alert.alert('Error', 'Failed to update user status');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primaryDark} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DashboardHeader />
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Users Management</Text>
        <Text style={styles.pageSubtitle}>All registered users across the system.</Text>
      </View>

      <View style={styles.filterContainer}>
        <Dropdown
          value={filter}
          options={['ALL', 'MEMBER', 'WORKER', 'FACILITY_MANAGER', 'ADMIN']}
          onSelect={setFilter}
        />
      </View>

      <View style={styles.listContainer}>
        {filteredUsers.length > 0 ? (
          <FlatList
            data={filteredUsers}
            contentContainerStyle={styles.listContent}
            renderItem={({ item, index }) => (
              <View style={[
                styles.userItem,
                index === 0 && styles.firstItem,
                index === users.length - 1 && styles.lastItem,
                index !== users.length - 1 && styles.middleItem
              ]}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
                  {item.phoneNumber && (
                    <Text style={styles.userPhone} numberOfLines={1}>{item.phoneNumber}</Text>
                  )}
                </View>
                
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText} textAlign="center">
                    {ROLE_LABELS[item.role] || item.role}
                  </Text>
                </View>

                <View style={styles.statusSection}>
                  <Switch
                    value={item.isActive}
                    onValueChange={() => handleToggleStatus(item)}
                    trackColor={{ false: colors.surfaceAlt, true: colors.action }}
                    thumbColor={colors.surface}
                    ios_backgroundColor={colors.surfaceAlt}
                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                  />
                  <Text style={[
                    styles.statusText,
                    { color: item.isActive ? colors.success : colors.textMuted }
                  ]}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  header: {
    padding: spacing.lg,
    paddingTop: 0,
    paddingBottom: spacing.md,
  },
  pageTitle: {
    fontSize: 32,
    fontFamily: 'serif',
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  pageSubtitle: {
    ...type.bodyMuted,
  },
  filterContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    zIndex: 10,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  listContent: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
    paddingVertical: 8,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  middleItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceAlt,
  },
  firstItem: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  lastItem: {
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  userInfo: {
    flex: 1.5,
    paddingRight: 8,
  },
  userName: {
    ...type.heading,
    fontSize: 16,
    marginBottom: 2,
  },
  userEmail: {
    ...type.small,
  },
  userPhone: {
    ...type.small,
    color: colors.textMuted,
    marginTop: 2,
  },
  roleBadge: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primaryText,
    textAlign: 'center',
  },
  statusSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...type.bodyMuted,
  },
});

export default UserMgmtScreen;
