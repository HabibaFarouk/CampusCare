import client from './client';

const managerApi = {
  getWorkers: async (filters = {}) => {
    const response = await client.get('/manager/workers', { params: filters });
    return response.data;
  },

  getWorker: async (workerId) => {
    const response = await client.get(`/manager/workers/${workerId}`);
    return response.data;
  },

  // Backend route: GET /manager/dashboard
  getDashboardKPIs: async () => {
    const response = await client.get('/manager/dashboard');
    return response.data;
  },

  getWorkloads: async (filters = {}) => {
    const response = await client.get('/manager/workloads', { params: filters });
    return response.data;
  },

  // Backend route: PUT /issues/:id/assign
  assignIssueToWorker: async (issueId, workerId) => {
    const response = await client.put(`/issues/${issueId}/assign`, { workerId });
    return response.data;
  },

  // Backend route: PUT /manager/workers/:id/status
  updateWorkerStatus: async (workerId, isActive) => {
    const response = await client.put(`/manager/workers/${workerId}/status`, { isActive });
    return response.data;
  },

  getAllIssues: async (filters = {}) => {
    const response = await client.get('/issues', { params: filters });
    return response.data;
  },

  getPrioritizedIssues: async () => {
    const response = await client.get('/issues/prioritized');
    return response.data;
  },

  closeIssue: async (issueId) => {
    const response = await client.put(`/issues/${issueId}/close`);
    return response.data;
  },

  deleteIssue: async (issueId) => {
    const response = await client.delete(`/issues/${issueId}`);
    return response.data;
  },
};

export default managerApi;
