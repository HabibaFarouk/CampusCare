// For now, the admin types primarily deal with users.
// We can re-export existing types to maintain a clear domain separation.
export type { User, UserRole } from './auth';
