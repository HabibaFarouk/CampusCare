import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    const requestPermissions = async () => {
      await ImagePicker.requestCameraPermissionsAsync();
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    };
    requestPermissions();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.Images],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      await uploadSelectedAsset(asset);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      await uploadSelectedAsset(asset);
    }
  };

  const uploadSelectedAsset = async (asset) => {
    try {
      setUploading(true);
      const url = await uploadImageToSupabase({
        uri: asset.uri,
        userId,
        mimeType: asset.mimeType,
      });
      const nextPhotos = [...selectedPhotos, url];
      setSelectedPhotos(nextPhotos);
      if (onUpload) {
        onUpload(nextPhotos);
      }
    } catch (error) {
      Alert.alert('Upload Error', error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async () => {
    if (selectedPhotos.length > 0 && onUpload) {
      await onUpload(selectedPhotos);
      setSelectedPhotos([]);
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
        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Text style={styles.buttonText}>📷 Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>🖼️ Pick Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Upload button */}
      {selectedPhotos.length > 0 && (
        <TouchableOpacity
          style={[styles.uploadButton, (loading || uploading) && styles.disabledButton]}
          onPress={handleUpload}
          disabled={loading || uploading}
        >
          {loading || uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.uploadButtonText}>
              Upload {selectedPhotos.length} Photo{selectedPhotos.length !== 1 ? 's' : ''}
            </Text>
          )}
        </TouchableOpacity>
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
  uploadButton: {
    backgroundColor: '#34C759',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default PhotoUploader;
