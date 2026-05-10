import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { apiUploadMemory } from '../api/client';
import { colors, spacing, radius, type } from '../theme';

export default function CreateMemoryScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState(null);

  // expo-image-picker gives us two separate functions: one for the gallery,
  // one for the camera. Both return an object with `canceled` and `assets`.
  async function pickFromGallery() {
    // The library asks for permission the first time, and remembers the choice.
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need gallery access to pick a photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7, // resize to save bandwidth + storage
      allowsEditing: true,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera access to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: true,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  }

  async function handleSave() {
    if (!title.trim()) return Alert.alert('Missing title', 'Give it a title.');
    if (!imageUri) return Alert.alert('Missing image', 'Pick or take a photo.');

    try {
      setSubmitting(true);
      await apiUploadMemory({ title: title.trim(), description: description.trim(), imageUri });
      // Reset the form and switch to the Home tab — HomeScreen's useFocusEffect
      // will refetch automatically when it regains focus.
      setTitle('');
      setDescription('');
      setImageUri(null);
      navigation.navigate('HomeTab');
    } catch (err) {
      Alert.alert('Upload failed', err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={pickFromGallery} style={styles.imageWrap}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.placeholder]}>
              <Text style={styles.placeholderEmoji}>📷</Text>
              <Text style={styles.placeholderTitle}>Add a photo</Text>
              <Text style={styles.placeholderText}>Tap to pick from your gallery</Text>
            </View>
          )}
        </Pressable>

        <View style={styles.row}>
          <Pressable
            onPress={pickFromGallery}
            style={({ pressed }) => [styles.secondaryButton, styles.rowLeft, pressed && styles.pressed]}
          >
            <Text style={styles.secondaryButtonText}>🖼  Gallery</Text>
          </Pressable>
          <Pressable
            onPress={takePhoto}
            style={({ pressed }) => [styles.secondaryButton, styles.rowRight, pressed && styles.pressed]}
          >
            <Text style={styles.secondaryButtonText}>📸  Camera</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={[styles.input, focused === 'title' && styles.inputFocused]}
          placeholder="A short title"
          placeholderTextColor={colors.textSubtle}
          value={title}
          onChangeText={setTitle}
          onFocus={() => setFocused('title')}
          onBlur={() => setFocused(null)}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[
            styles.input,
            styles.textarea,
            focused === 'desc' && styles.inputFocused,
          ]}
          placeholder="What's the story? (optional)"
          placeholderTextColor={colors.textSubtle}
          value={description}
          onChangeText={setDescription}
          onFocus={() => setFocused('desc')}
          onBlur={() => setFocused(null)}
          multiline
          numberOfLines={4}
        />

        <Pressable
          onPress={handleSave}
          disabled={submitting}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
            submitting && styles.disabled,
          ]}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Save memory</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.xl, paddingBottom: 60 },
  imageWrap: { marginBottom: spacing.md },
  image: {
    width: '100%',
    height: 260,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceAlt,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  placeholderEmoji: { fontSize: 44, marginBottom: spacing.md, opacity: 0.85 },
  placeholderTitle: { ...type.heading, marginBottom: spacing.xs },
  placeholderText: { ...type.small },
  row: { flexDirection: 'row', marginBottom: spacing.xl },
  rowLeft: { flex: 1, marginRight: spacing.sm },
  rowRight: { flex: 1, marginLeft: spacing.sm },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
  },
  secondaryButtonText: { color: colors.primaryDark, fontWeight: '600', fontSize: 15 },
  label: { ...type.small, fontWeight: '600', color: colors.text, marginBottom: spacing.sm, marginLeft: spacing.xs },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  inputFocused: { borderColor: colors.primary },
  textarea: { height: 110, textAlignVertical: 'top', paddingTop: 14 },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.6 },
});
