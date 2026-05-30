const express = require('express');
const router = express.Router();
const controller = require('../controllers/adminUser.controller');
const { authenticate, restrictTo } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.get('/', authenticate, restrictTo('owner'), controller.getAllUsers);
router.post('/', authenticate, restrictTo('owner'), authLimiter, controller.createUser);
router.patch('/:id', authenticate, restrictTo('owner'), authLimiter, controller.updateUser);
router.delete('/:id', authenticate, restrictTo('owner'), controller.deleteUser);

module.exports = router;
