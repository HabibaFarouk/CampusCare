import client from './client';

const adminApi = {
  getUsers: async () => {
    const response = await client.get('/admin/users');
    return response.data || [];
  },

  updateUserStatus: async (userId, isActive) => {
    const response = await client.put(`/admin/users/${userId}/status`, { isActive });
    return response.data?.user || response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await client.put(`/admin/users/${userId}/role`, { role });
    return response.data?.user || response.data;
  },
};

export default adminApi;
