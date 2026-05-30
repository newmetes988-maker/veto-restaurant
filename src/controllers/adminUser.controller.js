const { randomUUID: uuidv4 } = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const DEFAULT_TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';
const SALT_ROUNDS = 12;

const getAllUsers = catchAsync(async (req, res) => {
  const result = await db.query(
    `SELECT id, email, first_name, last_name, role, is_active, last_login_at, created_at
     FROM admin_users WHERE tenant_id = $1 ORDER BY created_at DESC`,
    [DEFAULT_TENANT_ID]
  );
  res.status(200).json({
    status: 'success',
    results: result.rows.length,
    data: { users: result.rows },
  });
});

const createUser = catchAsync(async (req, res) => {
  const { email, password, firstName, lastName, role = 'staff' } = req.body;

  const existing = await db.query(
    'SELECT id FROM admin_users WHERE tenant_id = $1 AND email = $2',
    [DEFAULT_TENANT_ID, email.toLowerCase()]
  );
  if (existing.rows.length > 0) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await db.query(
    `INSERT INTO admin_users (id, tenant_id, email, password_hash, first_name, last_name, role, is_active, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())
     RETURNING id, email, first_name, last_name, role, is_active, created_at`,
    [uuidv4(), DEFAULT_TENANT_ID, email.toLowerCase(), passwordHash, firstName, lastName, role]
  );

  const user = result.rows[0];
  res.status(201).json({
    status: 'success',
    message: 'User created successfully.',
    data: { user },
  });
});

const updateUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { email, password, firstName, lastName, role, isActive } = req.body;

  // Prevent self-deactivation
  if (id === req.user.userId && isActive === false) {
    throw new AppError('You cannot deactivate your own account.', 400);
  }

  // Prevent last owner from losing owner role
  if (role && role !== 'owner') {
    const selfCheck = await db.query(
      'SELECT role FROM admin_users WHERE id = $1 AND tenant_id = $2',
      [id, DEFAULT_TENANT_ID]
    );
    if (selfCheck.rows[0]?.role === 'owner') {
      const ownerCount = await db.query(
        'SELECT COUNT(*) as cnt FROM admin_users WHERE tenant_id = $1 AND role = $2 AND is_active = true',
        [DEFAULT_TENANT_ID, 'owner']
      );
      if (parseInt(ownerCount.rows[0].cnt, 10) <= 1) {
        throw new AppError('Cannot change role of the last active owner.', 400);
      }
    }
  }

  const setClauses = [];
  const values = [];
  let idx = 1;

  if (email !== undefined) { setClauses.push(`email = $${idx++}`); values.push(email.toLowerCase()); }
  if (password !== undefined) { setClauses.push(`password_hash = $${idx++}`); values.push(await bcrypt.hash(password, SALT_ROUNDS)); }
  if (firstName !== undefined) { setClauses.push(`first_name = $${idx++}`); values.push(firstName); }
  if (lastName !== undefined) { setClauses.push(`last_name = $${idx++}`); values.push(lastName); }
  if (role !== undefined) { setClauses.push(`role = $${idx++}`); values.push(role); }
  if (isActive !== undefined) { setClauses.push(`is_active = $${idx++}`); values.push(isActive); }

  if (setClauses.length === 0) throw new AppError('No fields to update', 400);
  setClauses.push('updated_at = NOW()');
  values.push(id, DEFAULT_TENANT_ID);

  const result = await db.query(
    `UPDATE admin_users SET ${setClauses.join(', ')} WHERE id = $${idx++} AND tenant_id = $${idx++} RETURNING id, email, first_name, last_name, role, is_active, updated_at`,
    values
  );

  if (result.rows.length === 0) throw new AppError('User not found', 404);

  res.status(200).json({
    status: 'success',
    message: 'User updated successfully.',
    data: { user: result.rows[0] },
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (id === req.user.userId) {
    throw new AppError('You cannot delete your own account.', 400);
  }

  const result = await db.query(
    'DELETE FROM admin_users WHERE id = $1 AND tenant_id = $2 RETURNING id',
    [id, DEFAULT_TENANT_ID]
  );
  if (result.rows.length === 0) throw new AppError('User not found', 404);

  res.status(204).json({ status: 'success', message: 'User deleted' });
});

module.exports = { getAllUsers, createUser, updateUser, deleteUser };
