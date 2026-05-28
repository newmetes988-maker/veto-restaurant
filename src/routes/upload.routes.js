const express = require('express');
const router = express.Router();
const { authenticate, restrictTo } = require('../middleware/auth');
const { uploadProductImage, uploadMiddleware } = require('../controllers/upload.controller');

router.post(
  '/',
  authenticate,
  restrictTo('owner', 'manager'),
  uploadMiddleware,
  uploadProductImage
);

module.exports = router;
