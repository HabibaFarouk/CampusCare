import { User } from './auth';

// =======================================================================
// Manager-specific types for workers, KPIs, and workloads
// =======================================================================

/**
 * Represents a worker user, extending the base User type.
 * This might be identical to User but is separated for clarity in the manager context.
 */
export type Worker = User & {
    // Add any worker-specific properties here if they exist in the backend response
    status: 'AVAILABLE' | 'ON_LEAVE' | 'BUSY';
};

/**
 * The structure of the Key Performance Indicators (KPIs) data
 * returned from the manager's dashboard endpoint.
 */
export interface DashboardKPIs {
  totalIssues: number;
  openIssues: number;
  inProgressIssues: number;
  resolvedToday: number;
  averageResolutionTime: number; // in hours or minutes, depending on backend
  issuesByPriority: {
    [key in 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT']: number;
  };
}

/**
 * The structure for a single worker's workload information.
 */
export interface WorkerWorkload {
  workerId: string;
  workerName: string;
  assignedIssuesCount: number;
  completedIssuesCount: number;
}
