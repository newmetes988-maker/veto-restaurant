const express = require('express');
const router = express.Router();
const controller = require('../controllers/setting.controller');
const { authenticate, restrictTo } = require('../middleware/auth');

// Public
router.get('/public', controller.getPublicSettings);

// Admin
router.get('/', authenticate, restrictTo('owner', 'manager'), controller.getAdminSettings);
router.patch('/', authenticate, restrictTo('owner', 'manager'), controller.updateSettings);

module.exports = router;
