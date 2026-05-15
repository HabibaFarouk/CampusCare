const express = require('express');
const controller = require('../Controllers/CampusCareController');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// ==========================================
// 1. Authentication & Password Management
// ==========================================
router.post('/auth/register', controller.registerUser);
router.post('/auth/login', controller.loginUser);
router.post('/auth/logout', authenticate, controller.logout);
router.post('/auth/forgot-password', controller.forgotPassword);
router.post('/auth/reset-password', controller.resetPassword);
router.put('/users/me', authenticate, controller.updateMyProfile);

// ==========================================
// Notifications
// ==========================================
router.get('/notifications', authenticate, controller.getNotifications);
router.put('/notifications/:id/read', authenticate, controller.markNotificationRead);
router.put('/notifications/read-all', authenticate, controller.markAllNotificationsRead);

// ==========================================
// 2.1 Community Member Flows
// ==========================================
// Members can create issues and view their own
router.post('/issues', authenticate, authorize('MEMBER', 'ADMIN'), controller.createIssue);
router.get('/issues/my', authenticate, authorize('MEMBER', 'ADMIN'), controller.getMyIssues);
router.put('/issues/:id/member', authenticate, authorize('MEMBER', 'ADMIN'), controller.updateMyIssue);
router.delete('/issues/:id/member', authenticate, authorize('MEMBER', 'ADMIN'), controller.deleteMyIssue);
// Any authenticated user can check a ticket's status (controller handles specific permission checks)
router.get('/issues/:id/status', authenticate, controller.getIssueStatus);
router.get('/api/issues/:id', authenticate, controller.getIssueStatus);

// ==========================================
// 2.2 Facility Manager Flows (Issue Management)
// ==========================================
router.get('/issues', authenticate, authorize('FACILITY_MANAGER', 'ADMIN'), controller.getAllIssues);
router.get('/issues/prioritized', authenticate, authorize('FACILITY_MANAGER', 'ADMIN'), controller.getPrioritizedIssues);
router.put('/issues/:id/assign', authenticate, authorize('FACILITY_MANAGER', 'ADMIN'), controller.assignIssueToWorker);
router.put('/issues/:id/status', authenticate, authorize('FACILITY_MANAGER', 'WORKER', 'ADMIN'), controller.updateIssueStatus);
router.put('/issues/:id/close', authenticate, authorize('FACILITY_MANAGER', 'ADMIN'), controller.closeIssue);
router.delete('/issues/:id', authenticate, authorize('FACILITY_MANAGER', 'ADMIN'), controller.deleteIssue);

// ==========================================
// 2.3 Worker Flows
// ==========================================
router.get('/issues/assigned', authenticate, authorize('WORKER', 'ADMIN'), controller.getAssignedIssues);
router.put('/issues/:id/start', authenticate, authorize('WORKER', 'ADMIN'), controller.startIssue);
router.put('/issues/:id/finish', authenticate, authorize('WORKER', 'ADMIN'), controller.finishIssue);
router.get('/issues/:id/comments', authenticate, controller.getIssueComments);
router.post('/issues/:id/comments', authenticate, authorize('WORKER', 'FACILITY_MANAGER', 'ADMIN'), controller.addComment);
router.post('/issues/:id/photo', authenticate, authorize('WORKER', 'ADMIN'), controller.uploadCompletionPhoto);

// ==========================================
// 3.1 Facility Manager (Worker & Dashboard)
// ==========================================
router.get('/manager/workers', authenticate, authorize('FACILITY_MANAGER', 'ADMIN'), controller.getWorkers);
router.get('/manager/workers/:id', authenticate, authorize('FACILITY_MANAGER', 'ADMIN'), controller.getWorkerDetails);
router.put('/manager/workers/:id/status', authenticate, authorize('FACILITY_MANAGER', 'ADMIN'), controller.updateWorkerStatus);
// NEW: KPI Dashboard & Workload endpoints
router.get('/manager/dashboard', authenticate, authorize('FACILITY_MANAGER', 'ADMIN'), controller.getDashboardKPIs);
router.get('/manager/workloads', authenticate, authorize('FACILITY_MANAGER', 'ADMIN'), controller.getWorkerWorkloads);

// ==========================================
// 3.2 System Admin (User Management)
// ==========================================
router.get('/admin/users', authenticate, authorize('ADMIN'), controller.getAllUsers);
router.put('/admin/users/:id/status', authenticate, authorize('ADMIN'), controller.updateUserStatus);
// NEW: Role update endpoint
router.put('/admin/users/:id/role', authenticate, authorize('ADMIN'), controller.updateUserRole);


module.exports = router;
