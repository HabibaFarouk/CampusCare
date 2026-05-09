import apiClient from '../api/apiClient';
import {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  ForgotPasswordData,
  ResetPasswordData,
} from '../types/auth';

/**
 * Service object for handling all authentication-related API requests.
 */
export const authService = {
  /**
   * Logs in a user.
   * @param credentials - The user's email and password.
   * @returns A promise that resolves to the authenticated user's data and token.
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Registers a new user.
   * @param data - The registration data for the new user.
   * @returns A promise that resolves to the new user's data and token.
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  /**
   * Logs out the currently authenticated user.
   */
  logout: async (): Promise<void> => {
    // The backend will handle session invalidation based on the JWT from the interceptor.
    await apiClient.post('/auth/logout');
  },

  /**
   * Sends a password reset link to the user's email.
   * @param data - The user's email.
   */
  forgotPassword: async (data: ForgotPasswordData): Promise<void> => {
    await apiClient.post('/auth/forgot-password', data);
  },

  /**
   * Resets the user's password using a token.
   * @param data - The reset token and new password.
   */
  resetPassword: async (data: ResetPasswordData): Promise<void> => {
    await apiClient.post('/auth/reset-password', data);
  },
};
