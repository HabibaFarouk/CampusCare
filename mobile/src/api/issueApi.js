import client from './client';

const issueApi = {
  createIssue: async (issueData) => {
    const response = await client.post('/issues', issueData);
    return response.data;
  },

  getMyIssues: async (filters = {}) => {
    // 🔴 FIXED: Changed from '/issues/my-issues' to '/issues/my' to match your backend
    const response = await client.get('/issues/my', { params: filters });
    return response.data;
  },

  getIssue: async (issueId) => {
    const response = await client.get(`/issues/${issueId}`);
    return response.data;
  },

  updateIssueStatus: async (issueId, status) => {
    const response = await client.patch(`/issues/${issueId}/status`, { status });
    return response.data;
  },

  updateIssue: async (issueId, updateData) => {
    const response = await client.patch(`/issues/${issueId}`, updateData);
    return response.data;
  },

  addComment: async (issueId, comment) => {
    const response = await client.post(`/issues/${issueId}/comments`, { comment });
    return response.data;
  },

  getComments: async (issueId) => {
    const response = await client.get(`/issues/${issueId}/comments`);
    return response.data;
  },

  uploadPhoto: async (issueId, photoData) => {
    const formData = new FormData();
    formData.append('photo', photoData);
    const response = await client.post(`/issues/${issueId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default issueApi;