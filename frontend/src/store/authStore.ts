import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types/auth';
import { authService } from '../services/authService';

/**
 * Defines the shape of the authentication state and its actions.
 */
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean; // Used to show a loading indicator on app startup
  setAuth: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>; // Checks for a persisted session
}

/**
 * Zustand store for managing authentication.
 *
 * This store handles the user's authentication status, user data, and JWT token.
 * It persists the session to the device's secure storage and provides actions
 * to log in, log out, and initialize the session on app start.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // Assume the app is loading until the session is checked

  /**
   * Sets the authentication state after a successful login/registration
   * and persists the session data to secure storage.
   */
  setAuth: async (user, token) => {
    await SecureStore.setItemAsync('userToken', token);
    await SecureStore.setItemAsync('userData', JSON.stringify(user));
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  /**
   * Logs the user out by calling the backend logout endpoint,
   * clearing the session from secure storage, and resetting the state.
   */
  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Server logout failed, clearing client session regardless.', error);
    } finally {
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userData');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  /**
   * Initializes the auth state by checking for a persisted session in
   * secure storage when the app starts.
   */
  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const userData = await SecureStore.getItemAsync('userData');

      if (token && userData) {
        set({
          user: JSON.parse(userData),
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to initialize auth store:', error);
      set({ isLoading: false });
    }
  },
}));
