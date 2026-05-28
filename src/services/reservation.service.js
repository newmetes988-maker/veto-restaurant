const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const qrService = require('./qr.service');
const whatsappService = require('./whatsapp.service');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// Default tenant/restaurant for MVP (multi-tenancy ready)
const DEFAULT_TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';
const DEFAULT_RESTAURANT_ID = '660e8400-e29b-41d4-a716-446655440001';

/**
 * Create a new reservation.
 */
const createReservation = async (data) => {
  const {
    customerName,
    customerPhone,
    customerEmail,
    partySize,
    scheduledAt,
    durationMinutes = 120,
    notes,
  } = data;

  const reservationId = uuidv4();

  return await db.withTransaction(async (client) => {
    // Insert reservation with 'pending' status
    const insertQuery = `
      INSERT INTO reservations (
        id, tenant_id, restaurant_id, customer_name, customer_phone,
        customer_email, party_size, scheduled_at, duration_minutes,
        status, source, notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING *
    `;

    const result = await client.query(insertQuery, [
      reservationId,
      DEFAULT_TENANT_ID,
      DEFAULT_RESTAURANT_ID,
      customerName,
      customerPhone || null,
      customerEmail || null,
      partySize,
      scheduledAt,
      durationMinutes,
      'pending',
      'web',
      notes || null,
    ]);

    const reservation = result.rows[0];

    // Log status change
    await client.query(
      `INSERT INTO reservation_logs (id, tenant_id, reservation_id, to_status, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [uuidv4(), DEFAULT_TENANT_ID, reservationId, 'pending']
    );

    logger.info('Reservation created', { reservationId, customerName, scheduledAt });
    return reservation;
  });
};

/**
 * Get all reservations with optional filtering and pagination.
 * Admin use-case.
 */
const getAllReservations = async (options) => {
  const {
    status,
    date,
    search,
    limit = 50,
    page = 1,
    sortBy = 'scheduled_at',
    order = 'DESC',
  } = options;

  const conditions = ['r.tenant_id = $1'];
  const values = [DEFAULT_TENANT_ID];
  let paramIndex = 2;

  if (status) {
    conditions.push(`r.status = $${paramIndex++}`);
    values.push(status);
  }

  if (date) {
    conditions.push(`DATE(r.scheduled_at) = $${paramIndex++}`);
    values.push(date);
  }

  if (search) {
    conditions.push(`(
      r.customer_name ILIKE $${paramIndex} 
      OR r.customer_phone ILIKE $${paramIndex}
      OR r.customer_email ILIKE $${paramIndex}
    )`);
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.join(' AND ');
  const offset = (page - 1) * limit;

  // Allowed sort columns (whitelist to prevent injection)
  const allowedSort = ['created_at', 'scheduled_at', 'customer_name', 'status', 'party_size'];
  const safeSortBy = allowedSort.includes(sortBy) ? sortBy : 'scheduled_at';
  const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const countResult = await db.query(
    `SELECT COUNT(*) FROM reservations r WHERE ${whereClause}`,
    values
  );
  const totalCount = parseInt(countResult.rows[0].count, 10);

  const dataQuery = `
    SELECT 
      r.*,
      json_build_object(
        'id', t.id,
        'name', t.name,
        'capacity', t.capacity
      ) as table_info
    FROM reservations r
    LEFT JOIN tables t ON r.table_id = t.id
    WHERE ${whereClause}
    ORDER BY r.${safeSortBy} ${safeOrder}
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `;
  values.push(limit, offset);

  const dataResult = await db.query(dataQuery, values);

  return {
    data: dataResult.rows,
    meta: {
      total: totalCount,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(totalCount / limit),
    },
  };
};

/**
 * Update reservation status.
 * If status is 'confirmed', generate QR code.
 */
const updateReservationStatus = async (reservationId, newStatus, adminUserId, reason) => {
  const validStatuses = ['pending', 'confirmed', 'rejected', 'cancelled', 'completed', 'no_show'];
  if (!validStatuses.includes(newStatus)) {
    throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
  }

  return await db.withTransaction(async (client) => {
    // Lock the row for update to prevent race conditions
    const currentResult = await client.query(
      'SELECT status FROM reservations WHERE id = $1 AND tenant_id = $2 FOR UPDATE',
      [reservationId, DEFAULT_TENANT_ID]
    );

    if (currentResult.rows.length === 0) {
      throw new AppError('Reservation not found', 404);
    }

    const currentStatus = currentResult.rows[0].status;

    // Business rule validation
    const terminalStatuses = ['completed', 'no_show'];
    if (terminalStatuses.includes(currentStatus)) {
      throw new AppError(`Cannot modify a reservation that is already ${currentStatus}`, 409);
    }

    if (currentStatus === newStatus) {
      throw new AppError(`Reservation is already ${newStatus}`, 409);
    }

    let qrCode = null;
    let qrDataUri = null;

    // Generate QR when confirming
    if (newStatus === 'confirmed') {
      const qr = await qrService.generateReservationQR(reservationId);
      qrCode = qr.token;
      qrDataUri = qr.qrDataUri;
    }

    // Build SET clauses and values dynamically to avoid parameter index bugs
    const setClauses = ['status = $1'];
    const updateValues = [newStatus];
    let idx = 2;

    if (qrCode) {
      setClauses.push(`qr_code = $${idx++}`);
      updateValues.push(qrCode);
    }
    if (adminUserId) {
      setClauses.push(`confirmed_by = $${idx++}`);
      updateValues.push(adminUserId);
    }
    if (newStatus === 'confirmed') {
      setClauses.push('confirmed_at = NOW()');
    }
    if (newStatus === 'rejected' && reason) {
      setClauses.push(`rejection_reason = $${idx++}`);
      updateValues.push(reason);
    }
    setClauses.push('updated_at = NOW()');

    updateValues.push(reservationId, DEFAULT_TENANT_ID);
    const idIdx = idx++;
    const tenantIdx = idx++;

    const updateQuery = `
      UPDATE reservations
      SET ${setClauses.join(', ')}
      WHERE id = $${idIdx} AND tenant_id = $${tenantIdx}
      RETURNING *
    `;

    const updateResult = await client.query(updateQuery, updateValues);
    const updatedReservation = updateResult.rows[0];

    // Audit log
    await client.query(
      `INSERT INTO reservation_logs (id, tenant_id, reservation_id, from_status, to_status, changed_by, reason, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [uuidv4(), DEFAULT_TENANT_ID, reservationId, currentStatus, newStatus, adminUserId || null, reason || null]
    );

    logger.info('Reservation status updated', {
      reservationId,
      from: currentStatus,
      to: newStatus,
      by: adminUserId,
    });

    const result = {
      ...updatedReservation,
      qr_data_uri: qrDataUri || undefined,
    };

    // Send WhatsApp notification (non-blocking, errors are swallowed)
    if (newStatus === 'confirmed' && updatedReservation.customer_phone) {
      const qrPageUrl = `${env.PUBLIC_BASE_URL}/qr/${qrCode}`;
      whatsappService.sendConfirmation({
        to: updatedReservation.customer_phone,
        reservation: updatedReservation,
        qrPageUrl,
      });
    } else if (['rejected', 'cancelled'].includes(newStatus) && updatedReservation.customer_phone) {
      whatsappService.sendStatusUpdate({
        to: updatedReservation.customer_phone,
        reservation: updatedReservation,
        status: newStatus,
      });
    }

    return result;
  });
};

/**
 * Verify a QR code token (check-in flow).
 */
const verifyQRToken = async (token) => {
  const result = await db.query(
    `SELECT r.*, rest.name as restaurant_name
     FROM reservations r
     JOIN restaurants rest ON r.restaurant_id = rest.id
     WHERE r.qr_code = $1 AND r.tenant_id = $2`,
    [token, DEFAULT_TENANT_ID]
  );

  if (result.rows.length === 0) {
    throw new AppError('Invalid or expired QR code', 404);
  }

  const reservation = result.rows[0];

  if (reservation.status !== 'confirmed') {
    throw new AppError(`Reservation is ${reservation.status}. Check-in not allowed.`, 409);
  }

  return reservation;
};

/**
 * Get reservation by QR token for public viewing (no time check).
 */
const getReservationByQR = async (token) => {
  const result = await db.query(
    `SELECT r.*, rest.name as restaurant_name
     FROM reservations r
     JOIN restaurants rest ON r.restaurant_id = rest.id
     WHERE r.qr_code = $1 AND r.tenant_id = $2`,
    [token, DEFAULT_TENANT_ID]
  );

  if (result.rows.length === 0) {
    throw new AppError('Invalid or expired QR code', 404);
  }

  return result.rows[0];
};

module.exports = {
  createReservation,
  getAllReservations,
  updateReservationStatus,
  verifyQRToken,
  getReservationByQR,
};
