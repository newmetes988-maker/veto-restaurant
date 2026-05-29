const express = require('express');
const router = express.Router();
const controller = require('../controllers/review.controller');
const { authenticate, restrictTo } = require('../middleware/auth');

// Public
router.get('/', controller.getApprovedReviews);
router.post('/', controller.createReview);

// Admin
router.get('/all', authenticate, restrictTo('owner', 'manager'), controller.getAllReviews);
router.patch('/:id/approve', authenticate, restrictTo('owner', 'manager'), controller.approveReview);
router.delete('/:id', authenticate, restrictTo('owner', 'manager'), controller.deleteReview);

module.exports = router;
