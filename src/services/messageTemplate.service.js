const db = require('../config/database');
const { randomUUID: uuidv4 } = require('crypto');
const AppError = require('../utils/AppError');

const DEFAULT_TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

/**
 * Get all message templates for the default tenant.
 */
const getAllTemplates = async () => {
  const result = await db.query(
    `SELECT id, name, type, subject, body, variables, is_active, created_at, updated_at
     FROM message_templates
     WHERE tenant_id = $1
     ORDER BY name`,
    [DEFAULT_TENANT_ID]
  );
  return result.rows;
};

/**
 * Get a single template by name.
 */
const getTemplateByName = async (name) => {
  const result = await db.query(
    `SELECT id, name, type, subject, body, variables, is_active
     FROM message_templates
     WHERE tenant_id = $1 AND name = $2 AND is_active = true`,
    [DEFAULT_TENANT_ID, name]
  );
  return result.rows[0] || null;
};

/**
 * Get a template by ID.
 */
const getTemplateById = async (id) => {
  const result = await db.query(
    `SELECT id, name, type, subject, body, variables, is_active, created_at, updated_at
     FROM message_templates
     WHERE tenant_id = $1 AND id = $2`,
    [DEFAULT_TENANT_ID, id]
  );
  if (result.rows.length === 0) {
    throw new AppError('Template not found', 404);
  }
  return result.rows[0];
};

/**
 * Create a new message template.
 */
const createTemplate = async (data) => {
  const { name, type = 'whatsapp', subject, body, variables = [], is_active = true } = data;

  const result = await db.query(
    `INSERT INTO message_templates (id, tenant_id, name, type, subject, body, variables, is_active, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
     RETURNING *`,
    [uuidv4(), DEFAULT_TENANT_ID, name, type, subject || null, body, JSON.stringify(variables), is_active]
  );

  return result.rows[0];
};

/**
 * Update an existing message template.
 */
const updateTemplate = async (id, data) => {
  const { name, type, subject, body, variables, is_active } = data;

  const setClauses = [];
  const values = [];
  let idx = 1;

  if (name !== undefined) { setClauses.push(`name = $${idx++}`); values.push(name); }
  if (type !== undefined) { setClauses.push(`type = $${idx++}`); values.push(type); }
  if (subject !== undefined) { setClauses.push(`subject = $${idx++}`); values.push(subject); }
  if (body !== undefined) { setClauses.push(`body = $${idx++}`); values.push(body); }
  if (variables !== undefined) { setClauses.push(`variables = $${idx++}`); values.push(JSON.stringify(variables)); }
  if (is_active !== undefined) { setClauses.push(`is_active = $${idx++}`); values.push(is_active); }

  if (setClauses.length === 0) {
    throw new AppError('No fields to update', 400);
  }

  setClauses.push(`updated_at = NOW()`);
  values.push(id, DEFAULT_TENANT_ID);

  const result = await db.query(
    `UPDATE message_templates
     SET ${setClauses.join(', ')}
     WHERE id = $${idx++} AND tenant_id = $${idx++}
     RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    throw new AppError('Template not found', 404);
  }

  return result.rows[0];
};

/**
 * Delete a message template.
 */
const deleteTemplate = async (id) => {
  const result = await db.query(
    `DELETE FROM message_templates WHERE id = $1 AND tenant_id = $2 RETURNING id`,
    [id, DEFAULT_TENANT_ID]
  );

  if (result.rows.length === 0) {
    throw new AppError('Template not found', 404);
  }
};

/**
 * Render a template by substituting variables.
 * Variables format: {{variable_name}}
 */
const renderTemplate = (templateBody, variables) => {
  let rendered = templateBody;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    rendered = rendered.replace(regex, value ?? '');
  }
  return rendered;
};

module.exports = {
  getAllTemplates,
  getTemplateByName,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  renderTemplate,
};
