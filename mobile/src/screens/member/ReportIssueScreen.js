import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  Picker,
} from 'react-native';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import PhotoUploader from '../../components/issues/PhotoUploader';
import { VALID_CATEGORIES } from '../../utils/constants';
import issueApi from '../../api/issueApi';

const ReportIssueScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'MAINTENANCE',
    location: '',
  });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setErrors({});

      // Validation
      if (!formData.title.trim()) {
        setErrors((prev) => ({ ...prev, title: 'Title is required' }));
        return;
      }
      if (!formData.description.trim()) {
        setErrors((prev) => ({
          ...prev,
          description: 'Description is required',
        }));
        return;
      }

      const issueData = {
        ...formData,
        photos,
      };

      await issueApi.createIssue(issueData);
      Alert.alert('Success', 'Issue reported successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Report an Issue</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Issue Title"
              placeholder="Brief title of the issue"
              value={formData.title}
              onChangeText={(value) =>
                setFormData({ ...formData, title: value })
              }
              error={errors.title}
            />

            <Input
              label="Category"
              placeholder="Select category"
              value={formData.category}
              onChangeText={(value) =>
                setFormData({ ...formData, category: value })
              }
            />

            <Input
              label="Location"
              placeholder="Where is this issue located?"
              value={formData.location}
              onChangeText={(value) =>
                setFormData({ ...formData, location: value })
              }
            />

            <Input
              label="Description"
              placeholder="Describe the issue in detail"
              value={formData.description}
              onChangeText={(value) =>
                setFormData({ ...formData, description: value })
              }
              error={errors.description}
              multiline
              numberOfLines={5}
            />

            <PhotoUploader
              photos={photos}
              onUpload={(uploadedPhotos) => setPhotos(uploadedPhotos)}
            />

            <Button
              title="Submit Report"
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
            />

            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="secondary"
              style={styles.cancelButton}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flexGrow: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  submitButton: {
    marginTop: 20,
  },
  cancelButton: {
    marginTop: 12,
  },
});

export default ReportIssueScreen;
