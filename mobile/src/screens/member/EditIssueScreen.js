import React, { useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import PhotoUploader from '../../components/issues/PhotoUploader';
import { VALID_CATEGORIES } from '../../utils/constants';
import issueApi from '../../api/issueApi';
import { useNotification } from '../../utils/NotificationContext';
import { colors, type, radius, spacing, shadow } from '../../theme';
import { useAuth } from '../../auth/AuthContext';

const EditIssueScreen = ({ navigation, route }) => {
  const issue = route.params?.issue;
  const [formData, setFormData] = useState({
    title: issue?.title || '',
    description: issue?.description || '',
    category: issue?.category || 'MAINTENANCE',
    building: issue?.location ? issue.location.split('-')[0]?.trim() : '',
    locationDetail: issue?.location ? issue.location.split('-').slice(1).join('-').trim() : '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [photoUrls, setPhotoUrls] = useState(issue?.imageUrl ? [issue.imageUrl] : []);
  const { showError, showSuccess } = useNotification();
  const { user } = useAuth();

  const categories = useMemo(
    () =>
      Object.keys(VALID_CATEGORIES).map((key) => ({
        label: key.replace('_', ' '),
        value: VALID_CATEGORIES[key],
      })),
    []
  );

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

      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: `${formData.building} - ${formData.locationDetail}`.trim(),
        imageUrl: photoUrls[0] || null,
      };

      await issueApi.updateMyIssue(issue.id, payload);
      showSuccess('Issue updated successfully');
      setTimeout(() => navigation.goBack(), 800);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to update issue';
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!issue) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Issue not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>Edit issue</Text>
              <Text style={styles.subtitle}>Update details before assignment.</Text>
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
                  photos={photoUrls}
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
                  title="Save changes"
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  },
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
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    ...type.bodyMuted,
    marginTop: spacing.xs,
  },
  form: {
    marginTop: spacing.sm,
  },
  fieldContainer: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  categoryButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  categoryButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  categoryArrow: {
    fontSize: 10,
    color: colors.textMuted,
  },
  categoryDropdown: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  categoryOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceAlt,
  },
  categoryOptionText: {
    fontSize: 16,
    color: colors.text,
  },
  categoryOptionTextSelected: {
    fontWeight: '700',
    color: colors.primary,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  cancelBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  submitButton: {
    flex: 1,
    marginLeft: spacing.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  emptyText: {
    ...type.bodyMuted,
  },
});

export default EditIssueScreen;
