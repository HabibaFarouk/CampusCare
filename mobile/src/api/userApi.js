import client from './client';

const userApi = {
  updateProfile: async (payload) => {
    const response = await client.put('/users/me', payload);
    return response.data?.user || response.data;
  },
};

export default userApi;
