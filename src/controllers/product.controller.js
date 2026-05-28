const productService = require('../services/product.service');
const catchAsync = require('../utils/catchAsync');

const getAllProducts = catchAsync(async (req, res) => {
  const products = await productService.getAllProducts(req.query);
  res.status(200).json({
    status: 'success',
    results: products.length,
    data: { products },
  });
});

const getProduct = catchAsync(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: { product },
  });
});

const createProduct = catchAsync(async (req, res) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json({
    status: 'success',
    data: { product },
  });
});

const updateProduct = catchAsync(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  res.status(200).json({
    status: 'success',
    data: { product },
  });
});

const deleteProduct = catchAsync(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

module.exports = {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
