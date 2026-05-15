import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Text,
} from 'react-native';
import IssueCard from '../../components/issues/IssueCard';
import Button from '../../components/common/Button';
import issueApi from '../../api/issueApi';

const AssignedTasksScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ASSIGNED');

  useEffect(() => {
    loadTasks();
  }, [filter]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const allTasks = await issueApi.getAssignedIssues();
      const data = filter === 'ALL'
        ? allTasks
        : allTasks.filter((t) => t.status === filter);
      setTasks(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load assigned tasks');
    } finally {
      setLoading(false);
    }
  };

  const renderTask = ({ item }) => (
    <IssueCard
      issue={item}
      onPress={() =>
        navigation.navigate('IssueDetail', { issueId: item.id })
      }
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
      <View style={styles.filterContainer}>
        {['ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].map((status) => (
          <Button
            key={status}
            title={status}
            onPress={() => setFilter(status)}
            variant={filter === status ? 'primary' : 'secondary'}
            size="sm"
            style={styles.filterButton}
          />
        ))}
      </View>

      {tasks.length > 0 ? (
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No assigned tasks</Text>
        </View>
      )}
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
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fcfaf8',
    borderBottomWidth: 1,
    borderBottomColor: '#e6dac3',
  },
  filterButton: {
    marginHorizontal: 4,
    flex: 1,
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
});

export default AssignedTasksScreen;
