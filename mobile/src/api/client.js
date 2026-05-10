import * as SecureStore from 'expo-secure-store';

// Read the backend URL from an environment variable set in .env at build time.
// EXPO_PUBLIC_ prefix = inlined into the JS bundle and readable on the phone.
const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  // Fail loudly in dev so nobody spends 20 minutes wondering why "fetch failed".
  console.warn(
    'EXPO_PUBLIC_API_URL is not set. Copy .env.example to .env and restart Expo.'
  );
}

// Thin fetch wrappers. We keep them small so students can see exactly what
// an HTTP request looks like — no magic libraries in the way.

async function authHeader() {
  const token = await SecureStore.getItemAsync('mj.access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Handles JSON requests. Throws on non-2xx so screens can `try / catch`.
async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, options);
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(body?.error || `Request failed (${res.status})`);
  }
  return body;
}

export async function apiGet(path) {
  const headers = await authHeader();
  return request(path, { method: 'GET', headers });
}

export async function apiPost(path, body) {
  const headers = { 'Content-Type': 'application/json', ...(await authHeader()) };
  return request(path, { method: 'POST', headers, body: JSON.stringify(body) });
}

export async function apiDelete(path) {
  const headers = await authHeader();
  const res = await fetch(`${API_URL}${path}`, { method: 'DELETE', headers });
  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    throw new Error(text || `Request failed (${res.status})`);
  }
}

// Image upload is special: it's multipart/form-data with a file blob.
// React Native's FormData understands the { uri, name, type } shape and
// streams the file directly — we must NOT set Content-Type ourselves,
// because fetch needs to insert the multipart boundary for us.
export async function apiUploadMemory({ title, description, imageUri }) {
  const form = new FormData();
  form.append('title', title);
  if (description) form.append('description', description);
  form.append('image', {
    uri: imageUri,
    name: 'memory.jpg',
    type: 'image/jpeg',
  });

  const headers = await authHeader();
  const res = await fetch(`${API_URL}/journals`, {
    method: 'POST',
    headers,
    body: form,
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error || `Upload failed (${res.status})`);
  return body;
}
