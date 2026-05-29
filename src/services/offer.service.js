const { randomUUID: uuidv4 } = require('crypto');
const db = require('../config/database');
const AppError = require('../utils/AppError');

const DEFAULT_TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

const getAllOffers = async (options = {}) => {
  const { active, featured, limit = 50 } = options;
  let conditions = ['tenant_id = $1'];
  let values = [DEFAULT_TENANT_ID];
  let idx = 2;

  if (active) { conditions.push(`is_active = $${idx++}`); values.push(true); }
  if (featured) { conditions.push(`is_featured = $${idx++}`); values.push(true); }

  const result = await db.query(
    `SELECT * FROM offers WHERE ${conditions.join(' AND ')} ORDER BY is_featured DESC, created_at DESC LIMIT $${idx++}`,
    [...values, limit]
  );
  return result.rows;
};

const getOfferById = async (id) => {
  const result = await db.query('SELECT * FROM offers WHERE id = $1 AND tenant_id = $2', [id, DEFAULT_TENANT_ID]);
  if (result.rows.length === 0) throw new AppError('Offer not found', 404);
  return result.rows[0];
};

const createOffer = async (data) => {
  const result = await db.query(
    `INSERT INTO offers (id, tenant_id, title, description, discount_percent, discount_amount, code, image_url, start_date, end_date, terms, is_featured, is_active, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()) RETURNING *`,
    [uuidv4(), DEFAULT_TENANT_ID, data.title, data.description || null, data.discountPercent || 0,
     data.discountAmount || 0, data.code || null, data.imageUrl || null,
     data.startDate || null, data.endDate || null, data.terms || null,
     data.isFeatured || false, data.isActive !== false]
  );
  return result.rows[0];
};

const updateOffer = async (id, data) => {
  const setClauses = [];
  const values = [];
  let idx = 1;

  if (data.title !== undefined) { setClauses.push(`title = $${idx++}`); values.push(data.title); }
  if (data.description !== undefined) { setClauses.push(`description = $${idx++}`); values.push(data.description); }
  if (data.discountPercent !== undefined) { setClauses.push(`discount_percent = $${idx++}`); values.push(data.discountPercent); }
  if (data.discountAmount !== undefined) { setClauses.push(`discount_amount = $${idx++}`); values.push(data.discountAmount); }
  if (data.code !== undefined) { setClauses.push(`code = $${idx++}`); values.push(data.code); }
  if (data.imageUrl !== undefined) { setClauses.push(`image_url = $${idx++}`); values.push(data.imageUrl); }
  if (data.startDate !== undefined) { setClauses.push(`start_date = $${idx++}`); values.push(data.startDate); }
  if (data.endDate !== undefined) { setClauses.push(`end_date = $${idx++}`); values.push(data.endDate); }
  if (data.terms !== undefined) { setClauses.push(`terms = $${idx++}`); values.push(data.terms); }
  if (data.isFeatured !== undefined) { setClauses.push(`is_featured = $${idx++}`); values.push(data.isFeatured); }
  if (data.isActive !== undefined) { setClauses.push(`is_active = $${idx++}`); values.push(data.isActive); }

  if (setClauses.length === 0) throw new AppError('No fields to update', 400);
  setClauses.push('updated_at = NOW()');
  values.push(id, DEFAULT_TENANT_ID);

  const result = await db.query(
    `UPDATE offers SET ${setClauses.join(', ')} WHERE id = $${idx++} AND tenant_id = $${idx++} RETURNING *`,
    values
  );
  if (result.rows.length === 0) throw new AppError('Offer not found', 404);
  return result.rows[0];
};

const deleteOffer = async (id) => {
  const result = await db.query('DELETE FROM offers WHERE id = $1 AND tenant_id = $2 RETURNING id', [id, DEFAULT_TENANT_ID]);
  if (result.rows.length === 0) throw new AppError('Offer not found', 404);
};

module.exports = { getAllOffers, getOfferById, createOffer, updateOffer, deleteOffer };
