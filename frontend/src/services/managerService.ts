import apiClient from '../api/apiClient';
import { DashboardKPIs, Worker, WorkerWorkload } from '../types/manager';

/**
 * Service for all facility manager-related API requests.
 */
export const managerService = {
  /**
   * Fetches the list of all workers.
   */
  getWorkers: async (): Promise<Worker[]> => {
    const response = await apiClient.get('/manager/workers');
    return response.data;
  },

  /**
   * Updates the status of a specific worker.
   * @param workerId - The ID of the worker to update.
   * @param status - The new status for the worker.
   */
  updateWorkerStatus: async (workerId: string, status: 'AVAILABLE' | 'ON_LEAVE' | 'BUSY'): Promise<Worker> => {
    const response = await apiClient.put(`/manager/workers/${workerId}/status`, { status });
    return response.data;
  },

  /**
   * Fetches the main dashboard Key Performance Indicators (KPIs).
   */
  getDashboardKPIs: async (): Promise<DashboardKPIs> => {
    const response = await apiClient.get('/manager/dashboard');
    return response.data;
  },

  /**
   * Fetches the current workload for all workers.
   */
  getWorkerWorkloads: async (): Promise<WorkerWorkload[]> => {
    const response = await apiClient.get('/manager/workloads');
    return response.data;
  },
};
