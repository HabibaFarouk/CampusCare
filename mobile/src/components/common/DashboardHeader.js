import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, type } from '../../theme';
import { useAuth } from '../../auth/AuthContext';

const DashboardHeader = () => {
  const { logout } = useAuth();

  return (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../../assets/Logo.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />
        <View>
          <Text style={styles.headerTitle}>CampusCare</Text>
          <Text style={styles.headerSubtitle}>German International University</Text>
        </View>
      </View>
      <View style={styles.headerActions}>
        <TouchableOpacity onPress={logout} style={styles.signOutBtn}>
          <Feather name="log-out" size={16} color={colors.text} />
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.bg,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: spacing.sm,
  },
  headerTitle: {
    ...type.heading,
    fontSize: 16,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    ...type.tiny,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signOutText: {
    ...type.small,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default DashboardHeader;
