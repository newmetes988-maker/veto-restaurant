const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const DEFAULT_TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

const getAllCategories = async (filters = {}) => {
  const { isActive } = filters;
  const conditions = ['tenant_id = $1'];
  const values = [DEFAULT_TENANT_ID];
  let paramIndex = 2;

  if (isActive !== undefined) {
    conditions.push(`is_active = $${paramIndex++}`);
    values.push(isActive);
  }

  const whereClause = conditions.join(' AND ');

  const result = await db.query(
    `SELECT * FROM categories WHERE ${whereClause} ORDER BY sort_order, name`,
    values
  );

  return result.rows;
};

const getCategoryById = async (id) => {
  const result = await db.query(
    'SELECT * FROM categories WHERE id = $1 AND tenant_id = $2',
    [id, DEFAULT_TENANT_ID]
  );
  if (result.rows.length === 0) {
    throw new AppError('Category not found', 404);
  }
  return result.rows[0];
};

const createCategory = async (data) => {
  const {
    name,
    nameAr,
    slug,
    icon,
    sortOrder,
  } = data;

  const result = await db.query(
    `INSERT INTO categories (id, tenant_id, name, name_ar, slug, icon, sort_order, is_active, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())
     RETURNING *`,
    [uuidv4(), DEFAULT_TENANT_ID, name, nameAr || name, slug, icon || 'utensils', sortOrder || 0]
  );

  logger.info('Category created', { categoryId: result.rows[0].id, name });
  return result.rows[0];
};

const updateCategory = async (id, data) => {
  const allowedFields = ['name', 'name_ar', 'slug', 'icon', 'sort_order', 'is_active'];
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
    `UPDATE categories SET ${updates.join(', ')} WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++} RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    throw new AppError('Category not found', 404);
  }

  logger.info('Category updated', { categoryId: id });
  return result.rows[0];
};

const deleteCategory = async (id) => {
  // Check if products use this category
  const productsResult = await db.query(
    'SELECT COUNT(*) FROM products WHERE category = (SELECT name FROM categories WHERE id = $1 AND tenant_id = $2) AND tenant_id = $2',
    [id, DEFAULT_TENANT_ID]
  );

  const productCount = parseInt(productsResult.rows[0].count, 10);
  if (productCount > 0) {
    throw new AppError(`Cannot delete: ${productCount} product(s) use this category. Move products first.`, 400);
  }

  const result = await db.query(
    'DELETE FROM categories WHERE id = $1 AND tenant_id = $2 RETURNING id',
    [id, DEFAULT_TENANT_ID]
  );

  if (result.rows.length === 0) {
    throw new AppError('Category not found', 404);
  }

  logger.info('Category deleted', { categoryId: id });
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
