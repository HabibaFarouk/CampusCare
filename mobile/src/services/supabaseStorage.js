import { supabase } from '../api/supabaseClient';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'heic'];
const BUCKET_NAME = process.env.EXPO_PUBLIC_SUPABASE_BUCKET || 'images';

const getExtension = (uri, mimeType) => {
  if (mimeType && mimeType.includes('/')) {
    const ext = mimeType.split('/')[1];
    if (ext) return ext.toLowerCase();
  }

  const match = uri.match(/\.([a-zA-Z0-9]+)$/);
  if (match && match[1]) return match[1].toLowerCase();

  return 'jpg';
};

const buildPath = ({ userId, ext }) => {
  const stamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 10);
  const safeExt = IMAGE_EXTENSIONS.includes(ext) ? ext : 'jpg';
  if (userId) {
    return `users/${userId}/${stamp}-${rand}.${safeExt}`;
  }
  return `posts/${stamp}-${rand}.${safeExt}`;
};

export const uploadImageToSupabase = async ({ uri, userId, mimeType }) => {
  if (!uri) {
    throw new Error('Missing image');
  }

  const ext = getExtension(uri, mimeType);
  if (!IMAGE_EXTENSIONS.includes(ext)) {
    throw new Error('Invalid file type. Use JPG, PNG, or WEBP images.');
  }

  const response = await fetch(uri);
  const blob = await response.blob();
  if (!blob) {
    throw new Error('Failed to read image data');
  }

  const path = buildPath({ userId, ext });

  const { error } = await supabase
    .storage
    .from(BUCKET_NAME)
    .upload(path, blob, {
      contentType: mimeType || `image/${ext}`,
      upsert: false,
    });

  if (error) {
    if (String(error.message).toLowerCase().includes('bucket')) {
      throw new Error(`Bucket "${BUCKET_NAME}" not found or access denied. Make sure it exists and is public.`);
    }
    throw new Error(error.message || 'Upload failed');
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  if (!data?.publicUrl) {
    throw new Error('Failed to get public URL');
  }

  return data.publicUrl;
};
