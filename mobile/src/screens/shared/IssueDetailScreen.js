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
import Input from '../../components/common/Input';
import issueApi from '../../api/issueApi';
import managerApi from '../../api/managerApi';
import { useAuth } from '../../auth/AuthContext';

const IssueDetailScreen = ({ route, navigation }) => {
  const { issueId } = route.params;
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commenting, setCommenting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadIssueDetails();
    if (user?.role === 'FACILITY_MANAGER' || user?.role === 'ADMIN') {
      loadWorkers();
    }
  }, [issueId]);

  const loadWorkers = async () => {
    try {
      const data = await managerApi.getWorkers();
      setWorkers(Array.isArray(data) ? data : []);
    } catch (error) {
      setWorkers([]);
    }
  };

  const loadIssueDetails = async () => {
    try {
      setLoading(true);
      const [issueData, commentsData] = await Promise.all([
        issueApi.getIssue(issueId),
        issueApi.getComments(issueId),
      ]);
      const photos = [issueData?.imageUrl, issueData?.completionPhotoUrl].filter(
        (url) => url && !String(url).startsWith('file://') && !String(url).startsWith('content://')
      );
      const normalized = {
        ...issueData,
        assignedToLabel:
          issueData?.assignedTo && typeof issueData.assignedTo === 'object'
            ? issueData.assignedTo.name || issueData.assignedTo.email
            : issueData?.assignedTo,
        photos,
      };
      setIssue(normalized);
      setComments(Array.isArray(commentsData) ? commentsData : []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load issue details');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (photos) => {
    try {
      setUploading(true);
      if (!Array.isArray(photos) || photos.length === 0) {
        return;
      }
      console.log('[IssueDetail] Photo upload start', { issueId, count: photos.length });
      for (const photo of photos) {
        await issueApi.uploadPhoto(issueId, photo);
      }
      setIssue((prev) => {
        const existing = prev?.photos || [];
        const merged = Array.from(new Set([...existing, ...photos]));
        return { ...prev, photos: merged };
      });
      console.log('[IssueDetail] Photo upload success', { issueId });
      Alert.alert('Success', 'Photos uploaded successfully');
      loadIssueDetails();
    } catch (error) {
      console.log('[IssueDetail] Photo upload failure', { message: error.message });
      Alert.alert('Error', 'Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  const handleAssign = async (workerId) => {
    try {
      setAssigning(true);
      await managerApi.assignIssueToWorker(issueId, workerId);
      await loadIssueDetails();
      Alert.alert('Success', 'Issue assigned to worker');
    } catch (error) {
      Alert.alert('Error', 'Failed to assign issue');
    } finally {
      setAssigning(false);
    }
  };

  const handleStart = async () => {
    try {
      setStatusUpdating(true);
      await issueApi.startTask(issueId);
      await loadIssueDetails();
      Alert.alert('Success', 'Issue marked in progress');
    } catch (error) {
      Alert.alert('Error', 'Failed to start issue');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleFinish = async () => {
    try {
      setStatusUpdating(true);
      await issueApi.finishTask(issueId);
      await loadIssueDetails();
      Alert.alert('Success', 'Issue finished');
    } catch (error) {
      Alert.alert('Error', 'Failed to finish issue');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleResolve = async () => {
    try {
      setStatusUpdating(true);
      await issueApi.closeIssue(issueId);
      await loadIssueDetails();
      Alert.alert('Success', 'Issue resolved');
    } catch (error) {
      Alert.alert('Error', 'Failed to resolve issue');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      setStatusUpdating(true);
      await issueApi.deleteMyIssue(issueId);
      Alert.alert('Success', 'Issue deleted');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete issue');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAddComment = async () => {
    const trimmed = commentText.trim();
    if (!trimmed) {
      Alert.alert('Error', 'Comment cannot be empty');
      return;
    }

    try {
      setCommenting(true);
      await issueApi.addComment(issueId, trimmed);
      setCommentText('');
      await loadIssueDetails();
    } catch (error) {
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setCommenting(false);
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
            <Text style={styles.value}>{issue.assignedToLabel}</Text>
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
        userId={user?.id}
      />

      {user?.role === 'WORKER' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Update Status</Text>
          <View style={styles.actionRow}>
            <Button
              title="Start"
              onPress={handleStart}
              size="sm"
              disabled={issue.status !== 'ASSIGNED' || statusUpdating}
              loading={statusUpdating}
              style={styles.actionButton}
            />
            <Button
              title="Finish"
              onPress={handleFinish}
              size="sm"
              disabled={issue.status !== 'IN_PROGRESS' || statusUpdating}
              loading={statusUpdating}
              style={styles.actionButtonLast}
            />
          </View>
        </View>
      )}

      {user?.role === 'MEMBER' && issue.createdById === user?.id && issue.status === 'SUBMITTED' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Member Actions</Text>
          <Button
            title="Delete Issue"
            onPress={handleDelete}
            size="sm"
            variant="danger"
            disabled={statusUpdating}
            loading={statusUpdating}
          />
        </View>
      )}

      {(user?.role === 'FACILITY_MANAGER' || user?.role === 'ADMIN') && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manager Actions</Text>
          <Button
            title="Resolve Issue"
            onPress={handleResolve}
            size="sm"
            disabled={issue.status === 'RESOLVED' || statusUpdating}
            loading={statusUpdating}
          />
        </View>
      )}

      {(user?.role === 'FACILITY_MANAGER' || user?.role === 'ADMIN') && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assign to Worker</Text>
          {workers.length > 0 ? (
            workers.map((worker) => (
              <View key={worker.id} style={styles.workerRow}>
                <View style={styles.workerInfo}>
                  <Text style={styles.workerName}>{worker.name}</Text>
                  <Text style={styles.workerEmail}>{worker.email}</Text>
                </View>
                <Button
                  title="Assign"
                  onPress={() => handleAssign(worker.id)}
                  size="sm"
                  loading={assigning}
                />
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No active workers available</Text>
          )}
        </View>
      )}

      {(user?.role === 'WORKER' || user?.role === 'FACILITY_MANAGER' || user?.role === 'ADMIN') && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Comment</Text>
          <Input
            placeholder="Write a comment"
            value={commentText}
            onChangeText={setCommentText}
            multiline
            numberOfLines={3}
          />
          <Button
            title="Post Comment"
            onPress={handleAddComment}
            size="sm"
            loading={commenting}
          />
        </View>
      )}

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
    backgroundColor: '#f6f1ec',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fcfaf8',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e6dac3',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1d1d1b',
    marginBottom: 12,
  },
  section: {
    backgroundColor: '#fcfaf8',
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e6dac3',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1b',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    color: '#68645e',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#1d1d1b',
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
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginRight: 8,
  },
  workerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e6dac3',
  },
  workerInfo: {
    flex: 1,
    marginRight: 12,
  },
  workerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1d1d1b',
  },
  workerEmail: {
    fontSize: 12,
    color: '#68645e',
  },
  emptyText: {
    fontSize: 14,
    color: '#949089',
    fontStyle: 'italic',
  },
});

export default IssueDetailScreen;
