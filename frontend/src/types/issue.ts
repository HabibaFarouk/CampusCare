import { User } from './auth';

export type IssueStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REOPENED';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: User;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  location: string;
  status: IssueStatus;
  priority: PriorityLevel;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: User;
  assignedToId?: string;
  assignedTo?: User;
  comments: Comment[];
  completionPhotos: string[];
}

export interface CreateIssueData {
  title: string;
  description: string;
  location: string;
  priority: PriorityLevel;
}

export interface UpdateIssueStatusData {
  status: IssueStatus;
}

export interface AssignIssueData {
  workerId: string;
}
