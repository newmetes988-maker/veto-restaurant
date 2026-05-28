const express = require('express');
const router = express.Router();
const controller = require('../controllers/category.controller');

router.get('/', controller.getAllCategories);
router.get('/:id', controller.getCategory);

module.exports = router;
