import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const memoryStore = new Map();
let secureStoreAvailablePromise = null;

const isSecureStoreAvailable = async () => {
  if (!secureStoreAvailablePromise) {
    secureStoreAvailablePromise = SecureStore.isAvailableAsync()
      .then((available) => Boolean(available))
      .catch(() => false);
  }
  return secureStoreAvailablePromise;
};

const getWebItem = async (key) => {
  if (typeof localStorage === 'undefined') {
    return memoryStore.get(key) ?? null;
  }
  const value = localStorage.getItem(key);
  return value === null ? null : value;
};

const setWebItem = async (key, value) => {
  if (typeof localStorage === 'undefined') {
    memoryStore.set(key, value);
    return;
  }
  localStorage.setItem(key, value);
};

const deleteWebItem = async (key) => {
  if (typeof localStorage === 'undefined') {
    memoryStore.delete(key);
    return;
  }
  localStorage.removeItem(key);
};

export const storage = {
  getItemAsync: async (key) => {
    if (Platform.OS === 'web') {
      return getWebItem(key);
    }

    if (await isSecureStoreAvailable()) {
      return SecureStore.getItemAsync(key);
    }

    return memoryStore.get(key) ?? null;
  },
  setItemAsync: async (key, value) => {
    if (Platform.OS === 'web') {
      await setWebItem(key, value);
      return;
    }

    if (await isSecureStoreAvailable()) {
      await SecureStore.setItemAsync(key, value);
      return;
    }

    memoryStore.set(key, value);
  },
  deleteItemAsync: async (key) => {
    if (Platform.OS === 'web') {
      await deleteWebItem(key);
      return;
    }

    if (await isSecureStoreAvailable()) {
      await SecureStore.deleteItemAsync(key);
      return;
    }

    memoryStore.delete(key);
  },
};
