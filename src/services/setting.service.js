const db = require('../config/database');
const AppError = require('../utils/AppError');

const DEFAULT_TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

const getSettings = async () => {
  const result = await db.query(
    `SELECT id, tenant_id, social_links, contact_phones, contact_email, address, updated_at
     FROM settings WHERE tenant_id = $1`,
    [DEFAULT_TENANT_ID]
  );
  return result.rows[0] || null;
};

const getOrCreateSettings = async () => {
  let settings = await getSettings();
  if (!settings) {
    const result = await db.query(
      `INSERT INTO settings (tenant_id, social_links, contact_phones, contact_email, address)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [DEFAULT_TENANT_ID, '{}', '[]', '', '']
    );
    settings = result.rows[0];
  }
  return settings;
};

const updateSettings = async (data) => {
  const setClauses = [];
  const values = [];
  let idx = 1;

  if (data.socialLinks !== undefined) {
    setClauses.push(`social_links = $${idx++}`);
    values.push(JSON.stringify(data.socialLinks));
  }
  if (data.contactPhones !== undefined) {
    setClauses.push(`contact_phones = $${idx++}`);
    values.push(JSON.stringify(data.contactPhones));
  }
  if (data.contactEmail !== undefined) {
    setClauses.push(`contact_email = $${idx++}`);
    values.push(data.contactEmail);
  }
  if (data.address !== undefined) {
    setClauses.push(`address = $${idx++}`);
    values.push(data.address);
  }

  if (setClauses.length === 0) throw new AppError('No fields to update', 400);
  setClauses.push('updated_at = NOW()');
  values.push(DEFAULT_TENANT_ID);

  const result = await db.query(
    `UPDATE settings SET ${setClauses.join(', ')} WHERE tenant_id = $${idx++} RETURNING *`,
    values
  );
  if (result.rows.length === 0) throw new AppError('Settings not found', 404);
  return result.rows[0];
};

module.exports = { getSettings, getOrCreateSettings, updateSettings };
