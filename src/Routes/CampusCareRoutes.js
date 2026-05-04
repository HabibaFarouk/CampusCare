const express = require('express');
const controller = require('../Controllers/CampusCareController');
const router = express.Router();

const { authenticate, authorize } = require('../middleware/auth');

// Auth (public)
router.post('/auth/register', controller.registerUser);
router.post('/auth/login', controller.loginUser);
router.post('/auth/logout', authenticate, controller.logout);

// Community member — tickets (create / my list)
router.post(
  '/issues',
  authenticate,
  authorize('MEMBER', 'FACILITY_MANAGER', 'ADMIN'),
  controller.createIssue
);
router.get(
  '/my/issues',
  authenticate,
  authorize('MEMBER', 'FACILITY_MANAGER', 'ADMIN'),
  controller.getMyIssues
);

// Facility Manager — list & prioritize (before /issues/:id)
router.get('/issues', authenticate, authorize('FACILITY_MANAGER', 'ADMIN'), controller.getAllIssues);
router.get(
  '/issues/prioritized',
  authenticate,
  authorize('FACILITY_MANAGER', 'ADMIN'),
  controller.getPrioritizedIssues
);

// Single ticket (any authorized role that owns / is assigned / FM / admin)
router.get('/issues/:id', authenticate, controller.getIssueStatus);

router.put(
  '/issues/:id/assign',
  authenticate,
  authorize('FACILITY_MANAGER', 'ADMIN'),
  controller.assignIssueToWorker
);
router.put(
  '/issues/:id/status',
  authenticate,
  authorize('FACILITY_MANAGER', 'WORKER', 'ADMIN'),
  controller.updateIssueStatus
);
router.put(
  '/issues/:id/close',
  authenticate,
  authorize('FACILITY_MANAGER', 'ADMIN'),
  controller.closeIssue
);
router.delete(
  '/issues/:id',
  authenticate,
  authorize('FACILITY_MANAGER', 'ADMIN'),
  controller.deleteIssue
);

// Worker flows
router.get(
  '/api/issues/assigned',
  authenticate,
  authorize('WORKER', 'ADMIN'),
  controller.getAssignedIssues
);
router.put(
  '/api/issues/:id/start',
  authenticate,
  authorize('WORKER', 'ADMIN'),
  controller.startIssue
);
router.put(
  '/api/issues/:id/finish',
  authenticate,
  authorize('WORKER', 'ADMIN'),
  controller.finishIssue
);
router.post(
  '/issues/:id/comments',
  authenticate,
  authorize('WORKER', 'ADMIN'),
  controller.addComment
);
router.post(
  '/issues/:id/photo',
  authenticate,
  authorize('WORKER', 'ADMIN'),
  controller.uploadCompletionPhoto
);

// Facility Manager — workers
router.get(
  '/api/workers',
  authenticate,
  authorize('FACILITY_MANAGER', 'ADMIN'),
  controller.getWorkers
);
router.put(
  '/api/workers/:id/status',
  authenticate,
  authorize('FACILITY_MANAGER', 'ADMIN'),
  controller.updateWorkerStatus
);

// System admin
router.get('/api/admin/users', authenticate, authorize('ADMIN'), controller.getAllUsers);
router.put(
  '/api/admin/users/:id/status',
  authenticate,
  authorize('ADMIN'),
  controller.updateUserStatus
);

module.exports = router;
