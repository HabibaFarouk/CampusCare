import { create } from 'zustand';
import { User, UserRole } from '../types/admin';
import { adminService } from '../services/adminService';

interface AdminState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchAllUsers: () => Promise<void>;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  updateUserStatus: (userId: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchAllUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const users = await adminService.getAllUsers();
      set({ users, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch users', isLoading: false });
    }
  },

  updateUserRole: async (userId, role) => {
    try {
      const updatedUser = await adminService.updateUserRole(userId, role);
      set((state) => ({
        users: state.users.map((user) => (user.id === userId ? updatedUser : user)),
      }));
    } catch (err: any) {
      // The component should handle displaying this error
      throw new Error(err.response?.data?.message || 'Failed to update user role');
    }
  },
  
  updateUserStatus: async (userId, status) => {
    try {
      const updatedUser = await adminService.updateUserStatus(userId, status);
       set((state) => ({
        users: state.users.map((user) => (user.id === userId ? updatedUser : user)),
      }));
    } catch (err: any) {
       throw new Error(err.response?.data?.message || 'Failed to update user status');
    }
  }
}));
