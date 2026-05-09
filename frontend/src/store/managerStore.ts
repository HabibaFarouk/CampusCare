import { create } from 'zustand';
import { DashboardKPIs, Worker, WorkerWorkload } from '../types/manager';
import { managerService } from '../services/managerService';

interface ManagerState {
  workers: Worker[];
  kpis: DashboardKPIs | null;
  workloads: WorkerWorkload[];
  isLoading: boolean;
  error: string | null;
  fetchDashboardData: () => Promise<void>;
  fetchWorkers: () => Promise<void>;
}

export const useManagerStore = create<ManagerState>((set) => ({
  workers: [],
  kpis: null,
  workloads: [],
  isLoading: false,
  error: null,

  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [kpis, workloads] = await Promise.all([
        managerService.getDashboardKPIs(),
        managerService.getWorkerWorkloads(),
      ]);
      set({ kpis, workloads, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch dashboard data', isLoading: false });
    }
  },

  fetchWorkers: async () => {
    set({ isLoading: true, error: null });
    try {
      const workers = await managerService.getWorkers();
      set({ workers, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch workers', isLoading: false });
    }
  },
}));
