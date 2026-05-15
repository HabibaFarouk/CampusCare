import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  SafeAreaView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../auth/AuthContext';
import issueApi from '../../api/issueApi';
import { colors, spacing, radius, type, shadow } from '../../theme';
import { useNotification } from '../../utils/NotificationContext';

const MemberDashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    ISSUED: 0,
    ASSIGNED: 0,
    IN_PROGRESS: 0,
    RESOLVED: 0,
    FINISHED: 0,
  });

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadStats();
    });
    return unsubscribe;
  }, [navigation]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await issueApi.getMyIssues();
      const issuesList = Array.isArray(data) ? data : (data?.data || []);
      
      const newStats = {
        ISSUED: 0,
        ASSIGNED: 0,
        IN_PROGRESS: 0,
        RESOLVED: 0,
        FINISHED: 0,
      };

      issuesList.forEach(issue => {
        if (newStats[issue.status] !== undefined) {
          newStats[issue.status]++;
        } else if (issue.status === 'SUBMITTED') {
          // Map SUBMITTED to ISSUED if that's the intention
          newStats.ISSUED++;
        }
      });

      setStats(newStats);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load stats';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ label, value }) => (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
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
          <TouchableOpacity style={styles.menuBtn}>
            <Feather name="menu" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.greetingSection}>
          <Text style={styles.welcomeText}>Welcome back</Text>
          <Text style={styles.nameText}>{user?.name || 'User'}</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primaryDark} style={styles.loader} />
        ) : (
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <StatCard label="ISSUED" value={stats.ISSUED} />
              <StatCard label="ASSIGNED" value={stats.ASSIGNED} />
            </View>
            <View style={styles.statsRow}>
              <StatCard label="IN PROGRESS" value={stats.IN_PROGRESS} />
              <StatCard label="RESOLVED" value={stats.RESOLVED} />
            </View>
            <View style={styles.statsRowFull}>
              <StatCard label="FINISHED" value={stats.FINISHED} />
            </View>
          </View>
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('ReportIssueTab')}
          >
            <View style={styles.actionIconContainer}>
              <Feather name="plus" size={20} color={colors.primaryText} />
            </View>
            <Text style={styles.actionTitle}>Report a new issue</Text>
            <Text style={styles.actionDesc}>Photo, location, category, description.</Text>
            <View style={styles.openBadge}>
              <Text style={styles.openBadgeText}>Open</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('MyIssuesTab')}
          >
            <View style={styles.actionIconContainer}>
              <Feather name="check-square" size={20} color={colors.primaryText} />
            </View>
            <Text style={styles.actionTitle}>My issues</Text>
            <Text style={styles.actionDesc}>Track every ticket you've submitted.</Text>
            <View style={styles.openBadge}>
              <Text style={styles.openBadgeText}>Open</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
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
    marginRight: spacing.md,
  },
  signOutText: {
    ...type.small,
    fontWeight: '600',
    marginLeft: 4,
  },
  menuBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  greetingSection: {
    marginBottom: spacing.xl,
  },
  welcomeText: {
    ...type.bodyMuted,
    marginBottom: 4,
  },
  nameText: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'serif', // Simple serif fallback for testing. Ideally load a custom font.
    color: colors.text,
  },
  loader: {
    marginVertical: spacing.xl,
  },
  statsContainer: {
    marginBottom: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statsRowFull: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#eee8e0', // Subtle border
  },
  statLabel: {
    ...type.tiny,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'serif',
    color: colors.text,
  },
  actionsContainer: {
    gap: spacing.md,
  },
  actionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#eee8e0',
  },
  actionIconContainer: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  actionTitle: {
    ...type.heading,
    marginBottom: spacing.xs,
  },
  actionDesc: {
    ...type.bodyMuted,
    marginBottom: spacing.lg,
  },
  openBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  openBadgeText: {
    ...type.small,
    fontWeight: '600',
    color: colors.text,
  },
});

export default MemberDashboardScreen;
