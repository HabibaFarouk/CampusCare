import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToSupabase } from '../../services/supabaseStorage';

const PhotoUploader = ({ photos = [], onUpload, loading = false, userId }) => {
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  const ensureCameraPermission = async () => {
    const current = await ImagePicker.getCameraPermissionsAsync();
    if (current.status === 'granted') return true;
    const next = await ImagePicker.requestCameraPermissionsAsync();
    if (next.status !== 'granted') {
      Alert.alert('Permission required', 'Camera access is needed to take a photo.');
      return false;
    }
    return true;
  };

  const ensureLibraryPermission = async () => {
    const current = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (current.status === 'granted') return true;
    const next = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (next.status !== 'granted') {
      Alert.alert('Permission required', 'Media library access is needed to pick a photo.');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await ensureLibraryPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      base64: true,
      quality: 0.9,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      await uploadSelectedAsset(asset);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await ensureCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      base64: true,
      quality: 0.9,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      await uploadSelectedAsset(asset);
    }
  };

  const uploadSelectedAsset = async (asset) => {
    try {
      setUploading(true);
      console.log('[PhotoUploader] Upload start', { uri: asset.uri });
      const url = await uploadImageToSupabase({
        uri: asset.uri,
        base64: asset.base64,
        userId,
        mimeType: asset.mimeType,
      });
      const nextPhotos = [...selectedPhotos, url];
      setSelectedPhotos(nextPhotos);
      console.log('[PhotoUploader] Upload success', { publicUrl: url });
      if (onUpload) {
        onUpload([url]);
      }
    } catch (error) {
      console.log('[PhotoUploader] Upload failed', { message: error.message });
      Alert.alert('Upload Error', error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const renderPhoto = ({ item, index }) => (
    <View key={index} style={styles.photoWrapper}>
      <Image source={{ uri: item }} style={styles.photo} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Photos</Text>

      {/* Display existing photos */}
      {photos.length > 0 && (
        <FlatList
          data={photos}
          renderItem={({ item, index }) => (
            <View style={styles.photoWrapper}>
              <Image
                source={{ uri: item }}
                style={styles.photo}
              />
            </View>
          )}
          keyExtractor={(item, index) => `existing-${index}`}
          horizontal
          scrollEnabled
          style={styles.photoList}
        />
      )}

      {/* Display selected photos preview */}
      {selectedPhotos.length > 0 && (
        <FlatList
          data={selectedPhotos}
          renderItem={renderPhoto}
          keyExtractor={(item, index) => `selected-${index}`}
          horizontal
          scrollEnabled
          style={styles.photoList}
        />
      )}

      {/* Upload buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, (loading || uploading) && styles.disabledButton]}
          onPress={takePhoto}
          disabled={loading || uploading}
        >
          <Text style={styles.buttonText}>📷 Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, (loading || uploading) && styles.disabledButton]}
          onPress={pickImage}
          disabled={loading || uploading}
        >
          <Text style={styles.buttonText}>🖼️ Pick Photo</Text>
        </TouchableOpacity>
      </View>

      {(loading || uploading) && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color="#34C759" />
          <Text style={styles.loadingText}>Uploading...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  photoList: {
    marginBottom: 12,
  },
  photoWrapper: {
    marginRight: 8,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#1d1d1b',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default PhotoUploader;
