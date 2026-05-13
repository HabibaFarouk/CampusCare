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
import { useNotification } from '../../utils/NotificationContext';

const MyIssuesScreen = ({ navigation }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const { showError, showSuccess } = useNotification();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadIssues();
    });
    return unsubscribe;
  }, [navigation, filter]);

  const loadIssues = async () => {
    try {
      setLoading(true);
      const data = await issueApi.getMyIssues({
        status: filter === 'ALL' ? undefined : filter,
      });
      
      // Axios sometimes wraps responses. This ensures we safely grab the array.
      const issuesList = Array.isArray(data) ? data : (data?.data || []);
      setIssues(issuesList);
      
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load issues';
      console.log("MY ISSUES FETCH ERROR:", error.response?.status, errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderIssue = ({ item }) => (
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
        {['ALL', 'SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].map((status) => (
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

      {issues.length > 0 ? (
        <FlatList
          data={issues}
          renderItem={renderIssue}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No issues found</Text>
          <Button
            title="Create New Issue"
            onPress={() => navigation.navigate('ReportIssueTab')}
          />
        </View>
      )}

      <View style={styles.fab}>
        <Button
          title="+ Report Issue"
          onPress={() => navigation.navigate('ReportIssueTab')}
          size="lg"
        />
      </View>
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
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
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
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  fab: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
});

export default MyIssuesScreen;