const { randomUUID: uuidv4 } = require('crypto');
const db = require('../config/database');
const AppError = require('../utils/AppError');

const DEFAULT_TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

const getAllEvents = async (options = {}) => {
  const { active, featured, limit = 50 } = options;
  let conditions = ['tenant_id = $1'];
  let values = [DEFAULT_TENANT_ID];
  let idx = 2;

  if (active) { conditions.push(`is_active = $${idx++}`); values.push(true); }
  if (featured) { conditions.push(`is_featured = $${idx++}`); values.push(true); }

  const result = await db.query(
    `SELECT * FROM events WHERE ${conditions.join(' AND ')} ORDER BY event_date ASC, event_time ASC LIMIT $${idx++}`,
    [...values, limit]
  );
  return result.rows;
};

const getEventById = async (id) => {
  const result = await db.query('SELECT * FROM events WHERE id = $1 AND tenant_id = $2', [id, DEFAULT_TENANT_ID]);
  if (result.rows.length === 0) throw new AppError('Event not found', 404);
  return result.rows[0];
};

const createEvent = async (data) => {
  const result = await db.query(
    `INSERT INTO events (id, tenant_id, title, description, image_url, event_date, event_time, location, max_capacity, price, is_featured, is_active, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()) RETURNING *`,
    [uuidv4(), DEFAULT_TENANT_ID, data.title, data.description || null, data.imageUrl || null,
     data.eventDate, data.eventTime || null, data.location || null,
     data.maxCapacity || 0, data.price || 0, data.isFeatured || false, data.isActive !== false]
  );
  return result.rows[0];
};

const updateEvent = async (id, data) => {
  const setClauses = [];
  const values = [];
  let idx = 1;

  if (data.title !== undefined) { setClauses.push(`title = $${idx++}`); values.push(data.title); }
  if (data.description !== undefined) { setClauses.push(`description = $${idx++}`); values.push(data.description); }
  if (data.imageUrl !== undefined) { setClauses.push(`image_url = $${idx++}`); values.push(data.imageUrl); }
  if (data.eventDate !== undefined) { setClauses.push(`event_date = $${idx++}`); values.push(data.eventDate); }
  if (data.eventTime !== undefined) { setClauses.push(`event_time = $${idx++}`); values.push(data.eventTime); }
  if (data.location !== undefined) { setClauses.push(`location = $${idx++}`); values.push(data.location); }
  if (data.maxCapacity !== undefined) { setClauses.push(`max_capacity = $${idx++}`); values.push(data.maxCapacity); }
  if (data.price !== undefined) { setClauses.push(`price = $${idx++}`); values.push(data.price); }
  if (data.isFeatured !== undefined) { setClauses.push(`is_featured = $${idx++}`); values.push(data.isFeatured); }
  if (data.isActive !== undefined) { setClauses.push(`is_active = $${idx++}`); values.push(data.isActive); }

  if (setClauses.length === 0) throw new AppError('No fields to update', 400);
  setClauses.push('updated_at = NOW()');
  values.push(id, DEFAULT_TENANT_ID);

  const result = await db.query(
    `UPDATE events SET ${setClauses.join(', ')} WHERE id = $${idx++} AND tenant_id = $${idx++} RETURNING *`,
    values
  );
  if (result.rows.length === 0) throw new AppError('Event not found', 404);
  return result.rows[0];
};

const deleteEvent = async (id) => {
  const result = await db.query('DELETE FROM events WHERE id = $1 AND tenant_id = $2 RETURNING id', [id, DEFAULT_TENANT_ID]);
  if (result.rows.length === 0) throw new AppError('Event not found', 404);
};

module.exports = { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent };
