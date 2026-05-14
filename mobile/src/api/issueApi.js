import client from './client';

const issueApi = {
  createIssue: async (issueData) => {
    const payload = {
      ...issueData,
      imageUrl: issueData?.imageUrl || issueData?.photos?.[0],
    };
    const response = await client.post('/issues', payload);
    return response.data;
  },

  // Member: GET /issues/my
  getMyIssues: async (filters = {}) => {
    const response = await client.get('/issues/my', { params: filters });
    return response.data;
  },

  // Worker: GET /issues/assigned
  getAssignedIssues: async () => {
    const response = await client.get('/issues/assigned');
    return response.data;
  },

  getIssue: async (issueId) => {
    const response = await client.get(`/issues/${issueId}/status`);
    return response.data;
  },

  // Backend route: PUT /issues/:id/status
  updateIssueStatus: async (issueId, status) => {
    const response = await client.put(`/issues/${issueId}/status`, { status });
    return response.data;
  },

  // Worker: PUT /issues/:id/start
  startTask: async (issueId) => {
    const response = await client.put(`/issues/${issueId}/start`);
    return response.data;
  },

  // Worker: PUT /issues/:id/finish
  finishTask: async (issueId) => {
    const response = await client.put(`/issues/${issueId}/finish`);
    return response.data;
  },

  // Manager: PUT /issues/:id/close
  closeIssue: async (issueId) => {
    const response = await client.put(`/issues/${issueId}/close`);
    return response.data;
  },

  addComment: async (issueId, comment) => {
    const response = await client.post(`/issues/${issueId}/comments`, { text: comment });
    return response.data;
  },

  getComments: async (issueId) => {
    const response = await client.get(`/issues/${issueId}/comments`);
    return response.data;
  },

  uploadPhoto: async (issueId, photoData) => {
    const photoUrl = typeof photoData === 'string' ? photoData : photoData?.uri;
    const response = await client.post(`/issues/${issueId}/photo`, { photoUrl });
    return response.data;
  },

  deleteMyIssue: async (issueId) => {
    const response = await client.delete(`/issues/${issueId}/member`);
    return response.data;
  },
};

export default issueApi;
