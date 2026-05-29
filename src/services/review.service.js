const { randomUUID: uuidv4 } = require('crypto');
const db = require('../config/database');
const AppError = require('../utils/AppError');

const DEFAULT_TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

const getAllReviews = async (options = {}) => {
  const { approved, limit = 50 } = options;
  let conditions = ['tenant_id = $1'];
  let values = [DEFAULT_TENANT_ID];
  let idx = 2;

  if (approved) { conditions.push(`is_approved = $${idx++}`); values.push(true); }

  const result = await db.query(
    `SELECT * FROM reviews WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC LIMIT $${idx++}`,
    [...values, limit]
  );
  return result.rows;
};

const getApprovedReviews = async (limit = 20) => {
  const result = await db.query(
    `SELECT * FROM reviews WHERE tenant_id = $1 AND is_approved = true ORDER BY created_at DESC LIMIT $2`,
    [DEFAULT_TENANT_ID, limit]
  );
  return result.rows;
};

const createReview = async (data) => {
  const result = await db.query(
    `INSERT INTO reviews (id, tenant_id, customer_name, rating, comment, is_approved, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
    [uuidv4(), DEFAULT_TENANT_ID, data.customerName, data.rating, data.comment || null, data.isApproved || false]
  );
  return result.rows[0];
};

const approveReview = async (id) => {
  const result = await db.query(
    'UPDATE reviews SET is_approved = true WHERE id = $1 AND tenant_id = $2 RETURNING *',
    [id, DEFAULT_TENANT_ID]
  );
  if (result.rows.length === 0) throw new AppError('Review not found', 404);
  return result.rows[0];
};

const deleteReview = async (id) => {
  const result = await db.query('DELETE FROM reviews WHERE id = $1 AND tenant_id = $2 RETURNING id', [id, DEFAULT_TENANT_ID]);
  if (result.rows.length === 0) throw new AppError('Review not found', 404);
};

module.exports = { getAllReviews, getApprovedReviews, createReview, approveReview, deleteReview };
