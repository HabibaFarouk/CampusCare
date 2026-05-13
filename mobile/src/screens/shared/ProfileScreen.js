import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../auth/AuthContext';

const ROLE_LABELS = {
  MEMBER: 'Community Member',
  WORKER: 'Maintenance Worker',
  FACILITY_MANAGER: 'Facility Manager',
  ADMIN: 'Administrator',
};

const ROLE_COLORS = {
  MEMBER: '#1565C0',
  WORKER: '#E65100',
  FACILITY_MANAGER: '#2E7D32',
  ADMIN: '#6A1B9A',
};

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const roleLabel = ROLE_LABELS[user?.role] || user?.role || 'User';
  const roleColor = ROLE_COLORS[user?.role] || '#1565C0';
  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const menuItems = [
    ...(user?.role === 'MEMBER'
      ? [
          {
            icon: '📋',
            title: 'My Issues',
            subtitle: 'View all your reported issues',
            onPress: () => navigation.navigate('MyIssuesTab'),
          },
        ]
      : []),
    ...(user?.role === 'WORKER'
      ? [
          {
            icon: '🔧',
            title: 'Assigned Tasks',
            subtitle: 'View tasks assigned to you',
            onPress: () => navigation.navigate('AssignedTasksTab'),
          },
        ]
      : []),
    ...(user?.role === 'FACILITY_MANAGER'
      ? [
          {
            icon: '📊',
            title: 'Dashboard',
            subtitle: 'View KPIs and statistics',
            onPress: () => navigation.navigate('FMDashboardTab'),
          },
          {
            icon: '👷',
            title: 'Worker Management',
            subtitle: 'Manage maintenance workers',
            onPress: () => navigation.navigate('WorkerMgmtTab'),
          },
        ]
      : []),
    ...(user?.role === 'ADMIN'
      ? [
          {
            icon: '👥',
            title: 'User Management',
            subtitle: 'Manage all users and roles',
            onPress: () => navigation.navigate('UserMgmtTab'),
          },
        ]
      : []),
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Profile header */}
      <View style={[styles.header, { backgroundColor: roleColor }]}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>{initials}</Text>
        </View>
        <Text style={styles.nameText}>{user?.name || 'User'}</Text>
        <Text style={styles.emailText}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>{roleLabel}</Text>
        </View>
      </View>

      {/* Quick actions */}
      {menuItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index < menuItems.length - 1 && styles.menuItemBorder,
                ]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuIconBox}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Sign out */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} activeOpacity={0.8}>
          <Text style={styles.signOutIcon}>🚪</Text>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>CampusCare v1.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fb',
  },
  contentContainer: {
    paddingBottom: 32,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
  },
  nameText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  section: {
    marginTop: 20,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8a8a9a',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f5',
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: '#9a9aaa',
  },
  menuArrow: {
    fontSize: 22,
    color: '#c8c8d8',
    fontWeight: '300',
  },
  signOutButton: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  signOutIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D32F2F',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#b0b0c0',
    marginTop: 28,
  },
});

export default ProfileScreen;
