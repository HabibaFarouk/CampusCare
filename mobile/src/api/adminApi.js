import client from './client';

const adminApi = {
  getUsers: async () => {
    const response = await client.get('/admin/users');
    const payload = response.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.users)) return payload.users;
    return [];
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
