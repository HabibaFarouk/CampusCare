import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native';
import StatusBadge from '../../components/common/StatusBadge';
import CommentList from '../../components/issues/CommentList';
import PhotoUploader from '../../components/issues/PhotoUploader';
import Button from '../../components/common/Button';
import issueApi from '../../api/issueApi';

const IssueDetailScreen = ({ route, navigation }) => {
  const { issueId } = route.params;
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadIssueDetails();
  }, [issueId]);

  const loadIssueDetails = async () => {
    try {
      setLoading(true);
      const [issueData, commentsData] = await Promise.all([
        issueApi.getIssue(issueId),
        issueApi.getComments(issueId),
      ]);
      setIssue(issueData);
      setComments(commentsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load issue details');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (photos) => {
    try {
      setUploading(true);
      for (const photo of photos) {
        await issueApi.uploadPhoto(issueId, photo);
      }
      Alert.alert('Success', 'Photos uploaded successfully');
      loadIssueDetails();
    } catch (error) {
      Alert.alert('Error', 'Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!issue) {
    return (
      <View style={styles.centerContainer}>
        <Text>Issue not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{issue.title}</Text>
        <StatusBadge status={issue.status} size="lg" />
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Category:</Text>
          <Text style={styles.value}>{issue.category}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Created:</Text>
          <Text style={styles.value}>
            {new Date(issue.createdAt).toLocaleDateString()}
          </Text>
        </View>
        {issue.assignedTo && (
          <View style={styles.row}>
            <Text style={styles.label}>Assigned to:</Text>
            <Text style={styles.value}>{issue.assignedTo}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{issue.description}</Text>
      </View>

      <PhotoUploader
        photos={issue.photos || []}
        onUpload={handlePhotoUpload}
        loading={uploading}
      />

      <CommentList comments={comments} />

      <View style={styles.actions}>
        <Button title="Back" onPress={() => navigation.goBack()} />
      </View>
    </ScrollView>
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
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  actions: {
    padding: 16,
    paddingBottom: 32,
  },
});

export default IssueDetailScreen;
