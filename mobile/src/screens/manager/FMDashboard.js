import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Text,
} from 'react-native';
import KPIWidget from '../../components/manager/KPIWidget';
import Button from '../../components/common/Button';
import DashboardHeader from '../../components/common/DashboardHeader';
import managerApi from '../../api/managerApi';
import { colors, spacing } from '../../theme';

const FMDashboard = ({ navigation }) => {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await managerApi.getDashboardKPIs();
      const mapped = {
        totalIssues: data?.totalIssues || 0,
        pendingIssues: (data?.submittedIssues || 0) + (data?.inProgressIssues || 0),
        resolvedIssues: data?.resolvedIssues || 0,
        totalWorkers: data?.activeWorkers || 0,
      };
      setKpis(mapped);
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DashboardHeader />
      <ScrollView style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>Facility Manager Dashboard</Text>
        </View>

      {kpis && (
        <View style={styles.kpiGrid}>
          <KPIWidget
            label="Total Issues"
            value={kpis.totalIssues || 0}
            trend={kpis.issuesTrend}
            icon="📋"
          />
          <KPIWidget
            label="Pending"
            value={kpis.pendingIssues || 0}
            trend={kpis.pendingTrend}
            icon="⏳"
          />
          <KPIWidget
            label="Resolved"
            value={kpis.resolvedIssues || 0}
            trend={kpis.resolvedTrend}
            icon="✅"
          />
          <KPIWidget
            label="Workers"
            value={kpis.totalWorkers || 0}
            icon="👷"
          />
        </View>
      )}

      <View style={styles.actionButtons}>
        <Button
          title="Manage Workers"
          onPress={() => navigation.navigate('WorkerMgmtTab')}
          style={styles.actionButton}
        />
        <Button
          title="View Issues"
          onPress={() => navigation.navigate('IssueList')}
          style={styles.actionButton}
        />
        <Button
          title="Reports"
          onPress={() => navigation.navigate('Reports')}
          style={styles.actionButton}
        />
      </View>

        <View style={styles.refreshButton}>
          <Button
            title="Refresh"
            onPress={loadDashboard}
            variant="secondary"
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
  },
  titleSection: {
    padding: spacing.lg,
    paddingBottom: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'serif',
    color: colors.text,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 8,
  },
  actionButtons: {
    paddingHorizontal: 16,
    marginVertical: 20,
  },
  actionButton: {
    marginVertical: 8,
  },
  refreshButton: {
    padding: 16,
  },
});

export default FMDashboard;
