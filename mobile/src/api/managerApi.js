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

  getDashboardKPIs: async () => {
    const response = await client.get('/manager/dashboard/kpis');
    return response.data;
  },

  getWorkloads: async (filters = {}) => {
    const response = await client.get('/manager/workloads', { params: filters });
    return response.data;
  },

  assignIssueToWorker: async (issueId, workerId) => {
    const response = await client.post(`/manager/issues/${issueId}/assign`, {
      workerId,
    });
    return response.data;
  },

  updateWorkerStatus: async (workerId, status) => {
    const response = await client.patch(`/manager/workers/${workerId}/status`, {
      status,
    });
    return response.data;
  },

  getReports: async (filters = {}) => {
    const response = await client.get('/manager/reports', { params: filters });
    return response.data;
  },
};

export default managerApi;
