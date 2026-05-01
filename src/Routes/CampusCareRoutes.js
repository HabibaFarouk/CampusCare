const express = require('express');
const controller = require('../Controllers/CampusCareController');
const router = express.Router();

// 3.2 System Admin (User Management) rana task
router.get('/api/admin/users', controller.getAllUsers);
router.put('/api/admin/users/:id/status', controller.updateUserStatus);

module.exports = router;