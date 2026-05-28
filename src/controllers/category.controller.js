const categoryService = require('../services/category.service');
const catchAsync = require('../utils/catchAsync');

const getAllCategories = catchAsync(async (req, res) => {
  const categories = await categoryService.getAllCategories(req.query);
  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: { categories },
  });
});

const getCategory = catchAsync(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: { category },
  });
});

const createCategory = catchAsync(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  res.status(201).json({
    status: 'success',
    data: { category },
  });
});

const updateCategory = catchAsync(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  res.status(200).json({
    status: 'success',
    data: { category },
  });
});

const deleteCategory = catchAsync(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

module.exports = {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
