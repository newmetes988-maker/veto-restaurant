const express = require('express');
const { z } = require('zod');
const router = express.Router();

const controller = require('../controllers/admin.controller');
const validate = require('../middleware/validate');
const { authenticate, restrictTo } = require('../middleware/auth');

// All admin routes require JWT authentication
router.use(authenticate);

const listReservationsSchema = z.object({
  query: z.object({
    status: z.enum(['pending', 'confirmed', 'rejected', 'cancelled', 'completed', 'no_show']).optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
    search: z.string().max(100).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    sortBy: z.enum(['created_at', 'scheduled_at', 'customer_name', 'status', 'party_size']).optional(),
    order: z.enum(['ASC', 'DESC']).optional(),
  }).optional(),
});

const updateStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid reservation ID'),
  }),
  body: z.object({
    status: z.enum(['pending', 'confirmed', 'rejected', 'cancelled', 'completed', 'no_show']),
    reason: z.string().max(500).optional(),
  }),
});

router.get(
  '/reservations',
  validate(listReservationsSchema),
  controller.getAllReservations
);

router.patch(
  '/reservations/:id/status',
  validate(updateStatusSchema),
  // Only owners, managers, and hosts can change status
  restrictTo('owner', 'manager', 'host'),
  controller.updateStatus
);

router.delete(
  '/reservations/:id',
  restrictTo('owner', 'manager'),
  controller.deleteReservation
);

router.delete(
  '/reservations',
  restrictTo('owner', 'manager'),
  controller.deleteReservations
);

module.exports = router;
