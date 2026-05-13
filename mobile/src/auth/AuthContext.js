import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { setUnauthorizedHandler } from '../api/client';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenExpiry, setTokenExpiry] = useState(null);

  const clearSession = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('userData');
    await SecureStore.deleteItemAsync('tokenExpiry');
    setUser(null);
    setTokenExpiry(null);
  };

  // Register the 401 handler so any expired/invalid token auto-logs out
  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    return () => setUnauthorizedHandler(null);
  }, []);

  // Check for a saved token when the app opens
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        const userData = await SecureStore.getItemAsync('userData');
        const expiry = await SecureStore.getItemAsync('tokenExpiry');

        if (token && userData) {
          if (expiry && Date.now() >= parseInt(expiry)) {
            await clearSession();
          } else {
            setUser(JSON.parse(userData));
            if (expiry) setTokenExpiry(parseInt(expiry));
          }
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Periodic check for token expiry (every minute)
  useEffect(() => {
    const interval = setInterval(() => {
      if (tokenExpiry && Date.now() >= tokenExpiry) {
        clearSession();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [tokenExpiry]);

  const login = async (email, password) => {
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.10:3000';
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Token expires in 7 days (matches backend JWT config)
      const expiryTime = Date.now() + 7 * 24 * 60 * 60 * 1000;

      await SecureStore.setItemAsync('accessToken', data.accessToken);
      await SecureStore.setItemAsync('userData', JSON.stringify(data.user));
      await SecureStore.setItemAsync('tokenExpiry', expiryTime.toString());

      setTokenExpiry(expiryTime);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.10:3000';
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Auto-login if the backend returned a token
      if (data.accessToken && data.user) {
        const expiryTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
        await SecureStore.setItemAsync('accessToken', data.accessToken);
        await SecureStore.setItemAsync('userData', JSON.stringify(data.user));
        await SecureStore.setItemAsync('tokenExpiry', expiryTime.toString());
        setTokenExpiry(expiryTime);
        setUser(data.user);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    await clearSession();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
