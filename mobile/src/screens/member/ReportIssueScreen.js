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
  TouchableOpacity,
} from 'react-native';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import PhotoUploader from '../../components/issues/PhotoUploader';
import { VALID_CATEGORIES } from '../../utils/constants';
import issueApi from '../../api/issueApi';
import { useNotification } from '../../utils/NotificationContext';
import { useAuth } from '../../auth/AuthContext';

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
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const { showError, showSuccess } = useNotification();
  const { user } = useAuth();

  const categories = Object.keys(VALID_CATEGORIES).map(key => ({
    label: key.replace('_', ' '),
    value: VALID_CATEGORIES[key]
  }));

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setErrors({});

      // Validation
      if (!formData.title.trim()) {
        const titleError = 'Title is required';
        setErrors((prev) => ({ ...prev, title: titleError }));
        showError(titleError);
        return;
      }
      if (!formData.description.trim()) {
        const descError = 'Description is required';
        setErrors((prev) => ({ ...prev, description: descError }));
        showError(descError);
        return;
      }

      const issueData = {
        ...formData,
        imageUrl: photos[0],
      };

      await issueApi.createIssue(issueData);
      showSuccess('Issue reported successfully');
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to report issue';
      showError(errorMsg);
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

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Category</Text>
              <TouchableOpacity
                style={styles.categoryButton}
                onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              >
                <Text style={styles.categoryButtonText}>
                  {formData.category.replace('_', ' ')}
                </Text>
                <Text style={styles.categoryArrow}>▼</Text>
              </TouchableOpacity>
              
              {showCategoryPicker && (
                <View style={styles.categoryDropdown}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.value}
                      style={styles.categoryOption}
                      onPress={() => {
                        setFormData({ ...formData, category: cat.value });
                        setShowCategoryPicker(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.categoryOptionText,
                          formData.category === cat.value && styles.categoryOptionTextSelected,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

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
              userId={user?.id}
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
  fieldContainer: {
    marginBottom: 16,
    zIndex: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  categoryArrow: {
    fontSize: 10,
    color: '#999',
  },
  categoryDropdown: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 100,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#666666',
  },
  categoryOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 20,
  },
  cancelButton: {
    marginTop: 12,
  },
});

export default ReportIssueScreen;
