import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  FlatList,
  ScrollView,
  Alert,
} from 'react-native';
import IssueCard from '../../components/issues/IssueCard';
import Button from '../../components/common/Button';
import managerApi from '../../api/managerApi';

const FILTERS = ['UNRESOLVED', 'SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'ALL'];

const IssueListScreen = ({ navigation }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('UNRESOLVED');

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
      if (filter === 'ALL' || filter === 'UNRESOLVED') {
        const data = await managerApi.getAllIssues();
        const list = Array.isArray(data) ? data : [];
        const filtered =
          filter === 'UNRESOLVED'
            ? list.filter((issue) => issue.status !== 'RESOLVED')
            : list;
        setIssues(filtered);
        return;
      }

      const data = await managerApi.getAllIssues({ status: filter });
      setIssues(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  const renderIssue = ({ item }) => (
    <IssueCard
      issue={item}
      onPress={() => navigation.navigate('IssueDetail', { issueId: item.id })}
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map((status) => (
          <Button
            key={status}
            title={status}
            onPress={() => setFilter(status)}
            variant={filter === status ? 'primary' : 'secondary'}
            size="sm"
            style={styles.filterButton}
          />
        ))}
      </ScrollView>

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
        </View>
      )}
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
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  filterContent: {
    paddingRight: 8,
  },
  filterButton: {
    marginRight: 8,
    minWidth: 120,
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
  },
});

export default IssueListScreen;
