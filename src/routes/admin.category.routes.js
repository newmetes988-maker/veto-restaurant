const express = require('express');
const router = express.Router();
const controller = require('../controllers/category.controller');
const { authenticate, restrictTo } = require('../middleware/auth');

router.use(authenticate);
router.use(restrictTo('owner', 'manager'));

router.post('/', controller.createCategory);
router.patch('/:id', controller.updateCategory);
router.delete('/:id', controller.deleteCategory);

module.exports = router;
