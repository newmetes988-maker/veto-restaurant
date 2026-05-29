const reviewService = require('../services/review.service');
const catchAsync = require('../utils/catchAsync');

const getAllReviews = catchAsync(async (req, res) => {
  const reviews = await reviewService.getAllReviews(req.query);
  res.status(200).json({ status: 'success', results: reviews.length, data: { reviews } });
});

const getApprovedReviews = catchAsync(async (req, res) => {
  const reviews = await reviewService.getApprovedReviews(req.query.limit);
  res.status(200).json({ status: 'success', results: reviews.length, data: { reviews } });
});

const createReview = catchAsync(async (req, res) => {
  const review = await reviewService.createReview(req.body);
  res.status(201).json({ status: 'success', message: 'Review submitted for approval', data: { review } });
});

const approveReview = catchAsync(async (req, res) => {
  const review = await reviewService.approveReview(req.params.id);
  res.status(200).json({ status: 'success', message: 'Review approved', data: { review } });
});

const deleteReview = catchAsync(async (req, res) => {
  await reviewService.deleteReview(req.params.id);
  res.status(204).json({ status: 'success', message: 'Review deleted' });
});

module.exports = { getAllReviews, getApprovedReviews, createReview, approveReview, deleteReview };
