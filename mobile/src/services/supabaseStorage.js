import { decode } from 'base64-arraybuffer';
import { supabase } from '../api/supabaseClient';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'heic'];
const BUCKET_NAME = process.env.EXPO_PUBLIC_SUPABASE_BUCKET || 'images';

const getExtension = (uri, mimeType) => {
  if (mimeType && mimeType.includes('/')) {
    const ext = mimeType.split('/')[1];
    if (ext) return ext.toLowerCase();
  }

  const match = uri?.match(/\.([a-zA-Z0-9]+)$/);
  if (match && match[1]) return match[1].toLowerCase();

  return 'jpg';
};

const getContentType = (ext, mimeType) => {
  if (mimeType && mimeType.includes('/')) return mimeType;
  if (ext === 'jpg') return 'image/jpeg';
  if (ext === 'heic') return 'image/heic';
  return `image/${ext}`;
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

export const uploadImageToSupabase = async ({ uri, base64, userId, mimeType }) => {
  if (!uri && !base64) {
    throw new Error('Missing image');
  }

  console.log('[uploadImageToSupabase] start', { uri, hasBase64: !!base64, userId, bucket: BUCKET_NAME });

  try {
    const ext = getExtension(uri, mimeType);
    if (!IMAGE_EXTENSIONS.includes(ext)) {
      throw new Error('Invalid file type. Use JPG, PNG, or WEBP images.');
    }

    if (!base64) {
      throw new Error('Missing base64 image data');
    }

    const body = decode(base64);
    if (!body || body.byteLength === 0) {
      throw new Error('Failed to decode image data');
    }

    const path = buildPath({ userId, ext });
    const contentType = getContentType(ext, mimeType);

    const { error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .upload(path, body, {
        contentType,
        cacheControl: '3600',
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

    if (data.publicUrl.startsWith('file://') || data.publicUrl.startsWith('content://')) {
      throw new Error('Invalid public URL generated');
    }

    console.log('[uploadImageToSupabase] success', { publicUrl: data.publicUrl, path });
    return data.publicUrl;
  } catch (error) {
    console.log('[uploadImageToSupabase] failure', { message: error.message });
    throw error;
  }
};
