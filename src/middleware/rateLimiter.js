const rateLimit = require('express-rate-limit');
const AppError = require('../utils/AppError');

/**
 * General API rate limiter.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new AppError('Too many requests from this IP. Please try again later.', 429));
  },
});

/**
 * Stricter limiter for reservation creation to prevent abuse.
 */
const createReservationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || req.headers['x-forwarded-for'] || 'unknown',
  handler: (req, res, next) => {
    next(new AppError('Reservation limit reached. Please try again later.', 429));
  },
});

module.exports = { apiLimiter, createReservationLimiter };
