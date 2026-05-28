const reservationService = require('../services/reservation.service');
const catchAsync = require('../utils/catchAsync');

/**
 * GET /api/v1/admin/reservations
 * List all reservations with filtering and pagination.
 */
const getAllReservations = catchAsync(async (req, res) => {
  const result = await reservationService.getAllReservations(req.query);

  res.status(200).json({
    status: 'success',
    results: result.data.length,
    meta: result.meta,
    data: { reservations: result.data },
  });
});

/**
 * PATCH /api/v1/admin/reservations/:id/status
 * Update reservation status (confirm, reject, cancel, etc.).
 */
const updateStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;
  const adminUserId = req.user?.userId || null; // Populated by JWT auth middleware

  const updated = await reservationService.updateReservationStatus(id, status, adminUserId, reason);

  res.status(200).json({
    status: 'success',
    message: `Reservation status updated to ${status}`,
    data: { reservation: updated },
  });
});

module.exports = {
  getAllReservations,
  updateStatus,
};
