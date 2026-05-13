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

const MyIssuesScreen = ({ navigation }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    loadIssues();
  }, [filter]);

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
      // 1. Force the terminal to log the EXACT backend error
      console.log("MY ISSUES FETCH ERROR:", error.response?.status, error.response?.data || error.message);
      
      // 2. Show the real error on the phone screen instead of a generic message
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load issues';
      Alert.alert('Fetch Error', errorMessage);
      
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
        {['ALL', 'SUBMITTED', 'IN_PROGRESS', 'RESOLVED'].map((status) => (
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
          // 3. Convert the Prisma Integer ID to a String to prevent FlatList crashes
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No issues found</Text>
          <Button
            title="Create New Issue"
            onPress={() => navigation.navigate('ReportIssue')}
          />
        </View>
      )}

      <View style={styles.fab}>
        <Button
          title="+ Report Issue"
          onPress={() => navigation.navigate('ReportIssue')}
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