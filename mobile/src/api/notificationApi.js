import client from './client';

const notificationApi = {
  getNotifications: async (filters = {}) => {
    const response = await client.get('/notifications', { params: filters });
    return response.data;
  },

  markRead: async (notificationId) => {
    const response = await client.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllRead: async () => {
    const response = await client.put('/notifications/read-all');
    return response.data;
  },
};

export default notificationApi;
