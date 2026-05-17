import client from './client';

const userApi = {
  getProfile: async () => {
    const response = await client.get('/users/me');
    return response.data?.user || response.data;
  },

  updateProfile: async (payload) => {
    const response = await client.put('/users/me', payload);
    return response.data?.user || response.data;
  },
};

export default userApi;
