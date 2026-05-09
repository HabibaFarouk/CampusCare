import apiClient from '../api/apiClient';
import {
  Issue,
  CreateIssueData,
  UpdateIssueStatusData,
  AssignIssueData,
} from '../types/issue';

/**
 * Service for all issue-related API requests.
 */
export const issueService = {
  // For Community Members
  createIssue: async (data: CreateIssueData): Promise<Issue> => {
    const response = await apiClient.post('/issues', data);
    return response.data;
  },
  getMyIssues: async (): Promise<Issue[]> => {
    const response = await apiClient.get('/issues/my');
    return response.data;
  },
  getIssueStatus: async (id: string): Promise<{ status: string }> => {
    const response = await apiClient.get(`/issues/${id}/status`);
    return response.data;
  },

  // For Facility Managers
  getAllIssues: async (): Promise<Issue[]> => {
    const response = await apiClient.get('/issues');
    return response.data;
  },
  getPrioritizedIssues: async (): Promise<Issue[]> => {
    const response = await apiClient.get('/issues/prioritized');
    return response.data;
  },
  assignIssueToWorker: async (id: string, data: AssignIssueData): Promise<Issue> => {
    const response = await apiClient.put(`/issues/${id}/assign`, data);
    return response.data;
  },
  updateIssueStatus: async (id: string, data: UpdateIssueStatusData): Promise<Issue> => {
    const response = await apiClient.put(`/issues/${id}/status`, data);
    return response.data;
  },
  closeIssue: async (id: string): Promise<Issue> => {
    const response = await apiClient.put(`/issues/${id}/close`, {});
    return response.data;
  },
  deleteIssue: async (id: string): Promise<void> => {
    await apiClient.delete(`/issues/${id}`);
  },

  // For Workers
  getAssignedIssues: async (): Promise<Issue[]> => {
    const response = await apiClient.get('/issues/assigned');
    return response.data;
  },
  startIssue: async (id: string): Promise<Issue> => {
    const response = await apiClient.put(`/issues/${id}/start`, {});
    return response.data;
  },
  finishIssue: async (id: string): Promise<Issue> => {
    const response = await apiClient.put(`/issues/${id}/finish`, {});
    return response.data;
  },
  addComment: async (id: string, content: string): Promise<Comment> => {
    const response = await apiClient.post(`/issues/${id}/comments`, { content });
    return response.data;
  },
  uploadCompletionPhoto: async (id: string, formData: FormData): Promise<Issue> => {
    const response = await apiClient.post(`/issues/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
