import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../common/Card';
import StatusBadge from '../common/StatusBadge';

const IssueCard = ({ issue, onPress }) => {
  return (
    <Card onPress={onPress} elevated>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{issue.title}</Text>
          <Text style={styles.category}>{issue.category}</Text>
        </View>
        <StatusBadge status={issue.status} size="sm" />
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {issue.description}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.date}>
          {new Date(issue.createdAt).toLocaleDateString()}
        </Text>
        {issue.assignedTo && (
          <Text style={styles.assignee}>Assigned to: {issue.assignedTo}</Text>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    paddingTop: 12,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  assignee: {
    fontSize: 12,
    color: '#007AFF',
  },
});

export default IssueCard;
