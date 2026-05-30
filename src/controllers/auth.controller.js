const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const env = require('../config/env');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const SALT_ROUNDS = 12;
const DEFAULT_TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

/**
 * Sign a JWT token with user payload.
 */
const signToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

/**
 * POST /api/v1/auth/register
 * Register a new admin user (protected: owner/manager only in real apps).
 * For setup simplicity, open in dev, restrict in production.
 */
const register = catchAsync(async (req, res) => {
  const { email, password, firstName, lastName, role = 'staff' } = req.body;

  // Check if email already exists
  const existing = await db.query(
    'SELECT id FROM admin_users WHERE tenant_id = $1 AND email = $2',
    [DEFAULT_TENANT_ID, email.toLowerCase()]
  );

  if (existing.rows.length > 0) {
    throw new AppError('An account with this email already exists.', 409);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Insert user
  const result = await db.query(
    `INSERT INTO admin_users (id, tenant_id, email, password_hash, first_name, last_name, role, created_at, updated_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW())
     RETURNING id, email, first_name, last_name, role, created_at`,
    [DEFAULT_TENANT_ID, email.toLowerCase(), passwordHash, firstName, lastName, role]
  );

  const user = result.rows[0];

  logger.info('New admin registered', { userId: user.id, email: user.email });

  res.status(201).json({
    status: 'success',
    message: 'Account created successfully.',
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
    },
  });
});

/**
 * POST /api/v1/auth/login
 * Authenticate user and return JWT.
 */
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Fetch user by email
  const result = await db.query(
    `SELECT id, tenant_id, email, password_hash, first_name, last_name, role, is_active
     FROM admin_users
     WHERE tenant_id = $1 AND email = $2`,
    [DEFAULT_TENANT_ID, email.toLowerCase()]
  );

  if (result.rows.length === 0) {
    throw new AppError('Invalid email or password.', 401);
  }

  const user = result.rows[0];

  // Check if account is active
  if (!user.is_active) {
    throw new AppError('Account is disabled. Contact your administrator.', 403);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password.', 401);
  }

  // Update last login
  await db.query(
    'UPDATE admin_users SET last_login_at = NOW() WHERE id = $1',
    [user.id]
  );

  // Generate JWT
  const token = signToken({
    userId: user.id,
    tenantId: user.tenant_id,
    role: user.role,
  });

  logger.info('Admin logged in', { userId: user.id, email: user.email });

  res.status(200).json({
    status: 'success',
    message: 'Login successful.',
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
    },
  });
});

/**
 * GET /api/v1/auth/me
 * Return current authenticated user.
 */
const getMe = catchAsync(async (req, res) => {
  const result = await db.query(
    `SELECT first_name, last_name, role FROM admin_users WHERE id = $1`,
    [req.user.userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('User not found.', 404);
  }

  const user = result.rows[0];

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
    },
  });
});

module.exports = {
  register,
  login,
  getMe,
};
