import apiClient from '../api/apiClient';
import { User, UserRole } from '../types/admin';

/**
 * Service for all system admin-related API requests.
 */
export const adminService = {
  /**
   * Fetches a list of all users in the system.
   */
  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },

  /**
   * Updates the status of a specific user.
   * @param userId - The ID of the user to update.
   * @param status - The new status for the user.
   */
  updateUserStatus: async (userId: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'): Promise<User> => {
    const response = await apiClient.put(`/admin/users/${userId}/status`, { status });
    return response.data;
  },

  /**
   * Updates the role of a specific user.
   * @param userId - The ID of the user to update.
   * @param role - The new role for the user.
   */
  updateUserRole: async (userId: string, role: UserRole): Promise<User> => {
    const response = await apiClient.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },
};
