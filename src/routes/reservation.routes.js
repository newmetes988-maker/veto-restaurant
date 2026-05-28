const express = require('express');
const { z } = require('zod');
const router = express.Router();

const controller = require('../controllers/reservation.controller');
const validate = require('../middleware/validate');
const { createReservationLimiter } = require('../middleware/rateLimiter');

const createReservationSchema = z.object({
  body: z.object({
    customerName: z.string().min(1, 'Customer name is required').max(255),
    customerPhone: z.string().optional(),
    customerEmail: z.string().email('Invalid email').optional(),
    partySize: z.number().int().min(1).max(50, 'Party size too large'),
    scheduledAt: z.string().datetime('Invalid ISO 8601 datetime'),
    durationMinutes: z.number().int().min(15).max(480).optional(),
    notes: z.string().max(1000).optional(),
  }).refine(
    (data) => data.customerPhone || data.customerEmail,
    { message: 'Either phone or email is required' }
  ),
});

const checkInSchema = z.object({
  params: z.object({
    token: z.string().uuid('Invalid QR token'),
  }),
});

router.post(
  '/',
  createReservationLimiter,
  validate(createReservationSchema),
  controller.createReservation
);

router.get(
  '/check-in/:token',
  validate(checkInSchema),
  controller.checkIn
);

module.exports = router;
