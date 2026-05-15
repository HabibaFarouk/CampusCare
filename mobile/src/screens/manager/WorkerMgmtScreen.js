import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Text,
} from 'react-native';
import WorkerRow from '../../components/manager/WorkerRow';
import Button from '../../components/common/Button';
import managerApi from '../../api/managerApi';

const WorkerMgmtScreen = ({ navigation }) => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadWorkers();
    });
    return unsubscribe;
  }, [navigation]);

  const loadWorkers = async () => {
    try {
      setLoading(true);
      const data = await managerApi.getWorkers();
      const normalized = (Array.isArray(data) ? data : []).map((worker) => ({
        ...worker,
        isActive: Boolean(worker.isActive),
      }));
      setWorkers(normalized);
    } catch (error) {
      Alert.alert('Error', 'Failed to load workers');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (workerId, newStatus) => {
    try {
      await managerApi.updateWorkerStatus(workerId, newStatus);
      loadWorkers();
      Alert.alert('Success', `Worker status updated`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update worker status');
    }
  };

  const renderWorker = ({ item }) => (
    <WorkerRow
      worker={item}
      onPress={() =>
        navigation.navigate('WorkerDetail', { workerId: item.id })
      }
      onStatusChange={handleStatusChange}
    />
  );

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
        <Text style={styles.title}>Worker Management</Text>
        <Text style={styles.subtitle}>{workers.length} workers</Text>
      </View>

      {workers.length > 0 ? (
        <FlatList
          data={workers}
          renderItem={renderWorker}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No workers found</Text>
        </View>
      )}

      <View style={styles.fab}>
        <Button
          title="Add Worker"
          onPress={() => navigation.navigate('AddWorker')}
          size="lg"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f1ec',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fcfaf8',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e6dac3',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1d1d1b',
  },
  subtitle: {
    fontSize: 14,
    color: '#68645e',
    marginTop: 4,
  },
  list: {
    padding: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#68645e',
  },
  fab: {
    padding: 16,
    backgroundColor: '#fcfaf8',
    borderTopWidth: 1,
    borderTopColor: '#e6dac3',
  },
});

export default WorkerMgmtScreen;
