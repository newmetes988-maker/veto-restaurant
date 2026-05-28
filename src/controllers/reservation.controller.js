const reservationService = require('../services/reservation.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

/**
 * POST /api/v1/reservations
 * Public endpoint to create a new reservation.
 */
const createReservation = catchAsync(async (req, res) => {
  const reservation = await reservationService.createReservation(req.body);

  res.status(201).json({
    status: 'success',
    message: 'Reservation request received. Awaiting confirmation.',
    data: { reservation },
  });
});

/**
 * GET /api/v1/check-in/:token
 * Public endpoint to verify a QR code reservation.
 */
const checkIn = catchAsync(async (req, res) => {
  const { token } = req.params;
  const reservation = await reservationService.verifyQRToken(token);

  res.status(200).json({
    status: 'success',
    data: {
      valid: true,
      reservation: {
        id: reservation.id,
        customerName: reservation.customer_name,
        partySize: reservation.party_size,
        scheduledAt: reservation.scheduled_at,
        restaurantName: reservation.restaurant_name,
      },
    },
  });
});

/**
 * GET /api/v1/reservations/by-qr/:token
 * Public endpoint to view reservation details by QR (no time check).
 */
const getByQR = catchAsync(async (req, res) => {
  const { token } = req.params;
  const reservation = await reservationService.getReservationByQR(token);

  res.status(200).json({
    status: 'success',
    data: {
      reservation: {
        id: reservation.id,
        customerName: reservation.customer_name,
        partySize: reservation.party_size,
        scheduledAt: reservation.scheduled_at,
        status: reservation.status,
        restaurantName: reservation.restaurant_name,
      },
    },
  });
});

module.exports = {
  createReservation,
  checkIn,
  getByQR,
};
