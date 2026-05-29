const offerService = require('../services/offer.service');
const catchAsync = require('../utils/catchAsync');

const getAllOffers = catchAsync(async (req, res) => {
  const offers = await offerService.getAllOffers(req.query);
  res.status(200).json({ status: 'success', results: offers.length, data: { offers } });
});

const getOffer = catchAsync(async (req, res) => {
  const offer = await offerService.getOfferById(req.params.id);
  res.status(200).json({ status: 'success', data: { offer } });
});

const createOffer = catchAsync(async (req, res) => {
  const offer = await offerService.createOffer(req.body);
  res.status(201).json({ status: 'success', message: 'Offer created', data: { offer } });
});

const updateOffer = catchAsync(async (req, res) => {
  const offer = await offerService.updateOffer(req.params.id, req.body);
  res.status(200).json({ status: 'success', message: 'Offer updated', data: { offer } });
});

const deleteOffer = catchAsync(async (req, res) => {
  await offerService.deleteOffer(req.params.id);
  res.status(204).json({ status: 'success', message: 'Offer deleted' });
});

module.exports = { getAllOffers, getOffer, createOffer, updateOffer, deleteOffer };
