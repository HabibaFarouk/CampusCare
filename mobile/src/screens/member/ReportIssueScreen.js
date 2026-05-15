import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
} from 'react-native';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import PhotoUploader from '../../components/issues/PhotoUploader';
import { VALID_CATEGORIES } from '../../utils/constants';
import issueApi from '../../api/issueApi';
import { useNotification } from '../../utils/NotificationContext';
import { colors, type, radius, spacing, shadow } from '../../theme';
import { useAuth } from '../../auth/AuthContext';

const ReportIssueScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'MAINTENANCE',
    building: '',
    locationDetail: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [photoUrls, setPhotoUrls] = useState([]);
  const { showError, showSuccess } = useNotification();
  const { user } = useAuth();

  const categories = Object.keys(VALID_CATEGORIES).map(key => ({
    label: key.replace('_', ' '),
    value: VALID_CATEGORIES[key]
  }));

  const handlePhotoUpload = (urls) => {
    if (!Array.isArray(urls) || urls.length === 0) return;
    setPhotoUrls((prev) => Array.from(new Set([...prev, ...urls])));
  };

  const handlePhotoDelete = (urlToDelete) => {
    setPhotoUrls((prev) => prev.filter((url) => url !== urlToDelete));
  };

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
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: `${formData.building} - ${formData.locationDetail}`.trim(),
        imageUrl: photoUrls[0] || null,
      };

      console.log('[ReportIssue] Create issue start', { imageUrl: issueData.imageUrl });
      const created = await issueApi.createIssue(issueData);
      console.log('[ReportIssue] Create issue success', { id: created?.id, imageUrl: created?.imageUrl });
      showSuccess('Issue reported successfully');
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to report issue';
      console.log('[ReportIssue] Create issue failure', { message: errorMsg });
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
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Report a new issue</Text>
            <Text style={styles.subtitle}>Be specific — clear tickets get fixed faster.</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Title"
              placeholder="e.g. Broken sink in bathroom"
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
              label="Building"
              placeholder="e.g. Building C"
              value={formData.building}
              onChangeText={(value) =>
                setFormData({ ...formData, building: value })
              }
            />

            <Input
              label="Location detail"
              placeholder="Floor, room, landmark"
              value={formData.locationDetail}
              onChangeText={(value) =>
                setFormData({ ...formData, locationDetail: value })
              }
            />

            <Input
              label="Description"
              placeholder=""
              value={formData.description}
              onChangeText={(value) =>
                setFormData({ ...formData, description: value })
              }
              error={errors.description}
              multiline
              numberOfLines={4}
              style={{ minHeight: 100, textAlignVertical: 'top' }}
            />

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Photo (optional)</Text>
              <PhotoUploader
                photos={[]}
                onUpload={handlePhotoUpload}
                onDelete={handlePhotoDelete}
                loading={loading}
                userId={user?.id}
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <Button
                title="Submit issue"
                onPress={handleSubmit}
                loading={loading}
                variant="action"
                style={styles.submitButton}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollView: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontFamily: 'serif',
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...type.bodyMuted,
  },
  form: {
    // padding removed as it's already inside card
  },
  fieldContainer: {
    marginBottom: 8,
    zIndex: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  categoryButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.surface,
  },
  categoryButtonText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  categoryArrow: {
    fontSize: 10,
    color: colors.textMuted,
  },
  categoryDropdown: {
    position: 'absolute',
    top: 66,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    shadowColor: '#1d1d1b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 100,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceAlt,
  },
  categoryOptionText: {
    fontSize: 16,
    color: colors.text,
  },
  categoryOptionTextSelected: {
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: spacing.xl,
    zIndex: 1, // To ensure it doesn't overlap category dropdown if it opens
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: spacing.sm,
  },
  cancelText: {
    ...type.body,
    fontWeight: '600',
  },
  submitButton: {
    paddingHorizontal: 24,
  },
});

export default ReportIssueScreen;
