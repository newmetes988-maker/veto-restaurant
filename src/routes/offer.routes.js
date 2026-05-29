const express = require('express');
const router = express.Router();
const controller = require('../controllers/offer.controller');
const { authenticate, restrictTo } = require('../middleware/auth');

// Public
router.get('/', controller.getAllOffers);
router.get('/:id', controller.getOffer);

// Admin
router.post('/', authenticate, restrictTo('owner', 'manager'), controller.createOffer);
router.patch('/:id', authenticate, restrictTo('owner', 'manager'), controller.updateOffer);
router.delete('/:id', authenticate, restrictTo('owner', 'manager'), controller.deleteOffer);

module.exports = router;
