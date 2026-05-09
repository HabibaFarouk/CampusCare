import { create } from 'zustand';
import { Issue } from '../types/issue';
import { issueService } from '../services/issueService';
import { UserRole } from '../types/auth';

interface IssueState {
  issues: Issue[];
  userIssues: Issue[];
  assignedIssues: Issue[];
  selectedIssue: Issue | null;
  isLoading: boolean;
  error: string | null;
  fetchIssues: (role: UserRole) => Promise<void>;
  fetchIssueById: (id: string) => Promise<void>;
  createIssue: (data: any) => Promise<void>;
  updateIssueStatus: (id: string, status: any) => Promise<void>;
  assignIssue: (id: string, workerId: string) => Promise<void>;
}

export const useIssueStore = create<IssueState>((set, get) => ({
  issues: [],
  userIssues: [],
  assignedIssues: [],
  selectedIssue: null,
  isLoading: false,
  error: null,

  fetchIssues: async (role: UserRole) => {
    set({ isLoading: true, error: null });
    try {
      let issues: Issue[] = [];
      if (role === 'FACILITY_MANAGER' || role === 'ADMIN') {
        issues = await issueService.getAllIssues();
        set({ issues });
      } else if (role === 'COMMUNITY_MEMBER') {
        const userIssues = await issueService.getMyIssues();
        set({ userIssues });
      } else if (role === 'WORKER') {
        const assignedIssues = await issueService.getAssignedIssues();
        set({ assignedIssues });
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch issues' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchIssueById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // This is a workaround as there is no direct getIssueById endpoint
      // We will try to find it in the existing lists
      const allIssues = [...get().issues, ...get().userIssues, ...get().assignedIssues];
      const issue = allIssues.find((i) => i.id === id);
      if (issue) {
        set({ selectedIssue: issue });
      } else {
        // If not found, we might need a specific endpoint or a different strategy
        set({ error: 'Issue not found' });
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch issue details' });
    } finally {
      set({ isLoading: false });
    }
  },

  createIssue: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newIssue = await issueService.createIssue(data);
      set((state) => ({ userIssues: [...state.userIssues, newIssue] }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to create issue' });
      throw err; // Re-throw to be caught in the component
    } finally {
      set({ isLoading: false });
    }
  },

  updateIssueStatus: async (id, status) => {
    set({ isLoading: true, error: null });
    try {
      const updatedIssue = await issueService.updateIssueStatus(id, { status });
      const updateList = (list: Issue[]) =>
        list.map((issue) => (issue.id === id ? updatedIssue : issue));

      set((state) => ({
        issues: updateList(state.issues),
        userIssues: updateList(state.userIssues),
        assignedIssues: updateList(state.assignedIssues),
        selectedIssue: state.selectedIssue?.id === id ? updatedIssue : state.selectedIssue,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to update status' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  assignIssue: async (id, workerId) => {
    set({ isLoading: true, error: null });
    try {
      const updatedIssue = await issueService.assignIssueToWorker(id, { workerId });
      set((state) => ({
        issues: state.issues.map((issue) => (issue.id === id ? updatedIssue : issue)),
        selectedIssue: state.selectedIssue?.id === id ? updatedIssue : state.selectedIssue,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to assign issue' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
}));
