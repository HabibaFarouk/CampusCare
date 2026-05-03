const express = require('express');
const controller = require('../Controllers/CampusCareController');
const router = express.Router();

// Use real authentication middleware (required)
const { authenticate, authorize } = require('../middleware/auth');
//Facility Manager flows (Part 2.2)
router.get('/issues', authenticate, authorize('FACILITY_MANAGER', 'ADMIN'), controller.getAllIssues);
router.get('/issues/prioritized', authenticate, authorize('FACILITY_MANAGER', 'ADMIN'), controller.getPrioritizedIssues);
router.put('/issues/:id/assign', authenticate, authorize('FACILITY_MANAGER', 'ADMIN'), controller.assignIssueToWorker);
router.put('/issues/:id/status', authenticate, authorize('FACILITY_MANAGER', 'WORKER', 'ADMIN'), controller.updateIssueStatus);
router.put('/issues/:id/close', authenticate, authorize('FACILITY_MANAGER', 'ADMIN'), controller.closeIssue);
router.delete('/issues/:id', authenticate, authorize('FACILITY_MANAGER', 'ADMIN'), controller.deleteIssue);

//2.3 Worker Flows
// Worker core routes (protected, worker-only)
router.get('/api/issues/assigned', authenticate, authorize('WORKER', 'ADMIN'), controller.getAssignedIssues);
router.put('/api/issues/:id/start', authenticate, authorize('WORKER', 'ADMIN'), controller.startIssue);
router.put('/api/issues/:id/finish', authenticate, authorize('WORKER', 'ADMIN'), controller.finishIssue);
router.post('/issues/:id/comments', authenticate, authorize('WORKER', 'ADMIN'), controller.addComment);
router.post('/issues/:id/photo', authenticate, authorize('WORKER', 'ADMIN'), controller.uploadCompletionPhoto);

// 3.2 System Admin (User Management) rana task
router.get('/api/admin/users', controller.getAllUsers);
router.put('/api/admin/users/:id/status', controller.updateUserStatus);

module.exports = router;