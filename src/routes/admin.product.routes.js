const express = require('express');
const router = express.Router();
const controller = require('../controllers/product.controller');
const { authenticate, restrictTo } = require('../middleware/auth');

router.use(authenticate);
router.use(restrictTo('owner', 'manager'));

router.post('/', controller.createProduct);
router.patch('/:id', controller.updateProduct);
router.delete('/:id', controller.deleteProduct);

module.exports = router;
