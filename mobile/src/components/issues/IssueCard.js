import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Card from '../common/Card';
import StatusBadge from '../common/StatusBadge';

const IssueCard = ({ issue, onPress }) => {
  const assigneeLabel =
    issue.assignedTo && typeof issue.assignedTo === 'object'
      ? issue.assignedTo.name || issue.assignedTo.email
      : issue.assignedTo;

  const previewImage = issue.imageUrl || issue.completionPhotoUrl;

  return (
    <Card onPress={onPress} elevated>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{issue.title}</Text>
          <Text style={styles.category}>{issue.category}</Text>
        </View>
        <StatusBadge status={issue.status} size="sm" />
      </View>

      <View style={styles.body}>
        {previewImage && (
          <Image source={{ uri: previewImage }} style={styles.thumbnail} />
        )}
        <Text style={styles.description} numberOfLines={2}>
          {issue.description}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.date}>
          {new Date(issue.createdAt).toLocaleDateString()}
        </Text>
        {assigneeLabel && (
          <Text style={styles.assignee}>Assigned to: {assigneeLabel}</Text>
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
    color: '#1d1d1b', // theme text
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: '#68645e', // theme textMuted
  },
  description: {
    fontSize: 14,
    color: '#68645e', // theme textMuted
    marginBottom: 12,
    lineHeight: 20,
    flex: 1,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0ece7', // theme surfaceAlt
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e6dac3', // theme border
    paddingTop: 12,
  },
  date: {
    fontSize: 12,
    color: '#949089', // theme textSubtle
    marginBottom: 4,
  },
  assignee: {
    fontSize: 12,
    color: '#1d1d1b', // theme text
    fontWeight: '600',
  },
});

export default IssueCard;
