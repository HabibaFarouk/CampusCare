import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  FlatList,
  ScrollView,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import IssueCard from '../../components/issues/IssueCard';
import Dropdown from '../../components/common/Dropdown';
import Input from '../../components/common/Input';
import managerApi from '../../api/managerApi';
import { STATUS_LABELS } from '../../utils/constants';

const FILTERS = ['UNRESOLVED', 'SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'FINISHED', 'FINALIZED', 'ALL'];
const ASSIGNEE_FILTERS = ['ALL', 'UNASSIGNED'];

const IssueListScreen = ({ navigation }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('UNRESOLVED');
  const [assignedFilter, setAssignedFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [workers, setWorkers] = useState([]);

  const assigneeOptions = useMemo(() => {
    const workerOptions = workers.map((worker) => `worker:${worker.id}`);
    return [...ASSIGNEE_FILTERS, ...workerOptions];
  }, [workers]);

  const assigneeLabels = useMemo(() => {
    const labels = {
      ALL: 'All',
      UNASSIGNED: 'Unassigned',
    };
    workers.forEach((worker) => {
      labels[`worker:${worker.id}`] = worker.name || worker.email || `Worker #${worker.id}`;
    });
    return labels;
  }, [workers]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadIssues();
      loadWorkers();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    loadIssues();
  }, [filter, assignedFilter, dateFrom, dateTo]);

  const loadWorkers = async () => {
    try {
      const data = await managerApi.getWorkers();
      setWorkers(Array.isArray(data) ? data : []);
    } catch (error) {
      setWorkers([]);
    }
  };

  const loadIssues = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'ALL' && filter !== 'UNRESOLVED') {
        params.status = filter;
      }
      if (assignedFilter === 'UNASSIGNED') {
        params.assignedToId = 'unassigned';
      } else if (assignedFilter.startsWith('worker:')) {
        params.assignedToId = assignedFilter.replace('worker:', '');
      }
      if (dateFrom) {
        params.startDate = dateFrom;
      }
      if (dateTo) {
        params.endDate = dateTo;
      }

      const data = await managerApi.getAllIssues(params);
      const list = Array.isArray(data) ? data : [];
      const filtered =
        filter === 'UNRESOLVED'
          ? list.filter((issue) => issue.status !== 'FINALIZED' && issue.status !== 'RESOLVED')
          : list;
      setIssues(filtered);
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.filterContainer}>
          <Dropdown
            value={filter}
            options={FILTERS}
            onSelect={setFilter}
            labelMap={{
              ...STATUS_LABELS,
              UNRESOLVED: 'Unresolved',
              ALL: 'All',
            }}
          />
          <Dropdown
            value={assignedFilter}
            options={assigneeOptions}
            onSelect={setAssignedFilter}
            labelMap={assigneeLabels}
          />
          <View style={styles.dateRow}>
            <Input
              label="From (YYYY-MM-DD)"
              value={dateFrom}
              onChangeText={setDateFrom}
              placeholder="2026-05-01"
            />
            <Input
              label="To (YYYY-MM-DD)"
              value={dateTo}
              onChangeText={setDateTo}
              placeholder="2026-05-15"
            />
          </View>
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
          </View>
        )}
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
  dateRow: {
    marginTop: 8,
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
  },
});

export default IssueListScreen;
