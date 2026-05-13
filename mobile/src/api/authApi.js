import client from './client';

const authApi = {
  login: async (email, password) => {
    const response = await client.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await client.post('/auth/register', userData);
    return response.data;
  },

  resetPassword: async (email) => {
    const response = await client.post('/auth/reset-password', { email });
    return response.data;
  },

  verifyToken: async () => {
    const response = await client.get('/auth/verify');
    return response.data;
  },

  logout: async () => {
    const response = await client.post('/auth/logout');
    return response.data;
  },
};

export default authApi;
