import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Card from '../common/Card';

const WorkerRow = ({ worker, onPress, onStatusChange }) => {
  const handleStatusToggle = () => {
    const newStatus = worker.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (onStatusChange) {
      onStatusChange(worker.id, newStatus);
    }
  };

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.name}>{worker.name}</Text>
          <Text style={styles.email}>{worker.email}</Text>
        </View>
        <View style={styles.status}>
          <Text
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  worker.status === 'ACTIVE' ? '#34C759' : '#FF9500',
              },
            ]}
          >
            {worker.status}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.label}>Tasks Assigned:</Text>
          <Text style={styles.value}>{worker.tasksAssigned || 0}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.label}>Completed:</Text>
          <Text style={styles.value}>{worker.tasksCompleted || 0}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.label}>Pending:</Text>
          <Text style={styles.value}>{worker.tasksPending || 0}</Text>
        </View>
      </View>

      {onStatusChange && (
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={handleStatusToggle}
        >
          <Text style={styles.toggleText}>
            {worker.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          </Text>
        </TouchableOpacity>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  email: {
    fontSize: 12,
    color: '#666',
  },
  status: {
    marginLeft: 12,
  },
  statusBadge: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E8E8E8',
    marginBottom: 12,
  },
  detailItem: {
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },
  toggleButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
});

export default WorkerRow;
