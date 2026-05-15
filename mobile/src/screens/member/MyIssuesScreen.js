import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Text,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import IssueCard from '../../components/issues/IssueCard';
import Button from '../../components/common/Button';
import Dropdown from '../../components/common/Dropdown';
import issueApi from '../../api/issueApi';
import { useNotification } from '../../utils/NotificationContext';
import { STATUS_LABELS } from '../../utils/constants';

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
  }, [navigation]);

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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Dropdown
          value={filter}
          options={['ALL', 'SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'FINISHED', 'FINALIZED']}
          onSelect={setFilter}
          labelMap={{
            ...STATUS_LABELS,
            ALL: 'All',
          }}
        />
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f6f1ec',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  },
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
    padding: 12,
    backgroundColor: '#fcfaf8',
    borderBottomWidth: 1,
    borderBottomColor: '#e6dac3',
    zIndex: 10,
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
    color: '#68645e',
    marginBottom: 20,
  },
  fab: {
    padding: 16,
    backgroundColor: '#fcfaf8',
    borderTopWidth: 1,
    borderTopColor: '#e6dac3',
  },
});

export default MyIssuesScreen;