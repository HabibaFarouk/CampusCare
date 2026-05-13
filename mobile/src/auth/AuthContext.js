import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';

// 🚨 IMPORTANT FOR EXPO GO: 
// You cannot use 'localhost' on a physical phone or Android emulator!
// Replace this with your computer's actual local IPv4 address (e.g., '192.168.1.15')
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.10:3001';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Starts true to show the spinner in App.js
  const [tokenExpiry, setTokenExpiry] = useState(null);

  // Helper function to check if token is expired
  const isTokenExpired = () => {
    if (!tokenExpiry) return false;
    return Date.now() >= tokenExpiry;
  };

  // 1. Check for a saved token when the app opens
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        const userData = await SecureStore.getItemAsync('userData');
        const expiry = await SecureStore.getItemAsync('tokenExpiry');
        
        if (token && userData) {
          // Check if token is not expired
          if (expiry && Date.now() >= parseInt(expiry)) {
            // Token expired, clear it
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('userData');
            await SecureStore.deleteItemAsync('tokenExpiry');
            setUser(null);
          } else {
            // If we have a valid token, automatically log them in
            setUser(JSON.parse(userData));
            if (expiry) {
              setTokenExpiry(parseInt(expiry));
            }
          }
        }
      } catch (error) {
        console.error("Error loading auth data:", error);
      } finally {
        setLoading(false); // Hide the spinner
      }
    };
    loadUser();
  }, []);

  // Set up interval to check token expiration every minute
  useEffect(() => {
    const interval = setInterval(async () => {
      if (isTokenExpired()) {
        await logout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [tokenExpiry]);

  // 2. The Login Function
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Save the token to the secure vault
      await SecureStore.setItemAsync('accessToken', data.accessToken);
      await SecureStore.setItemAsync('userData', JSON.stringify(data.user));
      
      // Calculate token expiry (assuming 24 hours from now, adjust based on backend)
      const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      await SecureStore.setItemAsync('tokenExpiry', expiryTime.toString());
      setTokenExpiry(expiryTime);
      
      // Update state to trigger navigation to the Home screen
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // 3. The Register Function
  const register = async (name, email, password, role) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // 4. The Logout Function
  const logout = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('userData');
    await SecureStore.deleteItemAsync('tokenExpiry');
    setUser(null);
    setTokenExpiry(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, API_URL }}>
      {children}
    </AuthContext.Provider>
  );
};

// A handy hook so our screens can just call useAuth()
export const useAuth = () => useContext(AuthContext);