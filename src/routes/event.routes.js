const express = require('express');
const router = express.Router();
const controller = require('../controllers/event.controller');
const { authenticate, restrictTo } = require('../middleware/auth');

// Public
router.get('/', controller.getAllEvents);
router.get('/:id', controller.getEvent);

// Admin
router.post('/', authenticate, restrictTo('owner', 'manager'), controller.createEvent);
router.patch('/:id', authenticate, restrictTo('owner', 'manager'), controller.updateEvent);
router.delete('/:id', authenticate, restrictTo('owner', 'manager'), controller.deleteEvent);

module.exports = router;
