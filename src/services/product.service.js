const { randomUUID: uuidv4 } = require('crypto');
const db = require('../config/database');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const DEFAULT_TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

const getAllProducts = async (filters = {}) => {
  const { category, search, isActive } = filters;
  const conditions = ['tenant_id = $1'];
  const values = [DEFAULT_TENANT_ID];
  let paramIndex = 2;

  if (category) {
    conditions.push(`category = $${paramIndex++}`);
    values.push(category);
  }
  if (isActive !== undefined) {
    conditions.push(`is_active = $${paramIndex++}`);
    values.push(isActive);
  }
  if (search) {
    conditions.push(`(name ILIKE $${paramIndex} OR name_ar ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.join(' AND ');

  const result = await db.query(
    `SELECT * FROM products WHERE ${whereClause} ORDER BY category, name`,
    values
  );

  return result.rows;
};

const getProductById = async (id) => {
  const result = await db.query(
    'SELECT * FROM products WHERE id = $1 AND tenant_id = $2',
    [id, DEFAULT_TENANT_ID]
  );
  if (result.rows.length === 0) {
    throw new AppError('Product not found', 404);
  }
  return result.rows[0];
};

const createProduct = async (data) => {
  const {
    name,
    nameAr,
    description,
    descriptionAr,
    price,
    category,
    imageUrl,
    badge,
  } = data;

  const result = await db.query(
    `INSERT INTO products (id, tenant_id, name, name_ar, description, description_ar, price, category, image_url, badge, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
     RETURNING *`,
    [uuidv4(), DEFAULT_TENANT_ID, name, nameAr || null, description || null, descriptionAr || null, price, category, imageUrl || null, badge || null]
  );

  logger.info('Product created', { productId: result.rows[0].id, name });
  return result.rows[0];
};

const updateProduct = async (id, data) => {
  const allowedFields = ['name', 'name_ar', 'description', 'description_ar', 'price', 'category', 'image_url', 'badge', 'is_active'];
  const updates = [];
  const values = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(data)) {
    const dbKey = key.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`);
    if (allowedFields.includes(dbKey) && value !== undefined) {
      updates.push(`${dbKey} = $${paramIndex++}`);
      values.push(value);
    }
  }

  if (updates.length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  updates.push(`updated_at = NOW()`);
  values.push(id, DEFAULT_TENANT_ID);

  const result = await db.query(
    `UPDATE products SET ${updates.join(', ')} WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++} RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    throw new AppError('Product not found', 404);
  }

  logger.info('Product updated', { productId: id });
  return result.rows[0];
};

const deleteProduct = async (id) => {
  const result = await db.query(
    'DELETE FROM products WHERE id = $1 AND tenant_id = $2 RETURNING id',
    [id, DEFAULT_TENANT_ID]
  );

  if (result.rows.length === 0) {
    throw new AppError('Product not found', 404);
  }

  logger.info('Product deleted', { productId: id });
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
