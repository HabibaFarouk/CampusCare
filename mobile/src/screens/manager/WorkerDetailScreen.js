import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Alert } from 'react-native';
import Button from '../../components/common/Button';
import managerApi from '../../api/managerApi';

const WorkerDetailScreen = ({ navigation, route }) => {
  const workerId = route?.params?.workerId;
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorker = async () => {
      if (!workerId) return;
      try {
        setLoading(true);
        const data = await managerApi.getWorker(workerId);
        setWorker(data);
      } catch (error) {
        Alert.alert('Error', 'Failed to load worker details');
      } finally {
        setLoading(false);
      }
    };

    loadWorker();
  }, [workerId]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Worker Details</Text>
      {worker ? (
        <View style={styles.detailsCard}>
          <Text style={styles.name}>{worker.name}</Text>
          <Text style={styles.email}>{worker.email}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{worker.isActive ? 'ACTIVE' : 'INACTIVE'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Active Tasks:</Text>
            <Text style={styles.value}>{worker.activeTasks || 0}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Finalized Tasks:</Text>
            <Text style={styles.value}>{worker.resolvedTasks || 0}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Joined:</Text>
            <Text style={styles.value}>
              {worker.createdAt ? new Date(worker.createdAt).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
        </View>
      ) : (
        <Text style={styles.subtitle}>No worker selected.</Text>
      )}
      <Button title="Back" onPress={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f6f1ec',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 16,
  },
  detailsCard: {
    backgroundColor: '#fcfaf8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1d1d1b',
    marginBottom: 6,
  },
  email: {
    fontSize: 12,
    color: '#68645e',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: '#68645e',
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1d1d1b',
  },
});

export default WorkerDetailScreen;
