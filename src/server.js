const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');
const { pool } = require('./config/database');

const PORT = env.PORT;
const DEFAULT_TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

// Auto-seed database on first run
const autoSeed = async () => {
  try {
    const checkResult = await pool.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tenants')"
    );
    if (!checkResult.rows[0].exists) {
      logger.info('First run detected — seeding database...');
      const schemaPath = path.join(__dirname, '..', 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      await pool.query(schema);
      logger.info('Database seeded successfully.');
    } else {
      logger.info('Database already seeded.');
    }

    // Ensure default admin user exists
    const adminResult = await pool.query(
      'SELECT id FROM admin_users WHERE tenant_id = $1 AND email = $2',
      [DEFAULT_TENANT_ID, 'admin@restaurant.com']
    );
    if (adminResult.rows.length === 0) {
      const passwordHash = await bcrypt.hash('admin1234', 12);
      await pool.query(
        `INSERT INTO admin_users (id, tenant_id, email, password_hash, first_name, last_name, role, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())`,
        ['cfea9362-cb1e-401c-8d8f-4a825e110935', DEFAULT_TENANT_ID, 'admin@restaurant.com', passwordHash, 'Admin', 'User', 'owner']
      );
      logger.info('Default admin user created: admin@restaurant.com / admin1234');
    } else {
      logger.info('Default admin user already exists.');
    }

    // Ensure default message templates exist
    const templateCheck = await pool.query(
      'SELECT COUNT(*) as count FROM message_templates WHERE tenant_id = $1',
      [DEFAULT_TENANT_ID]
    );
    if (parseInt(templateCheck.rows[0].count, 10) === 0) {
      await pool.query(`
        INSERT INTO message_templates (id, tenant_id, name, type, body, variables) VALUES
        ('880e8400-e29b-41d4-a716-446655440100', $1, 'reservation_confirmed', 'whatsapp',
         '🍽️ *Reservation Confirmed*\n\nHello {{customer_name}},\n\nYour table at *Veto Café & Restaurant* is confirmed.\n\n📅 *Date:* {{date}}\n🕐 *Time:* {{time}}\n👥 *Guests:* {{party_size}}\n\n📍 *Location:* Gleembay / Montaza, Alexandria\n\n🎟️ *Your QR Code:*\n{{qr_url}}\n\nOpen the link to view and download your check-in QR code.\n\nNeed to modify? Reply here or call us.\n\nThank you! 🧡',
         '["customer_name","date","time","party_size","qr_url"]'),
        ('880e8400-e29b-41d4-a716-446655440101', $1, 'reservation_rejected', 'whatsapp',
         'Hello {{customer_name}},\n\nWe regret to inform you that your reservation request for *{{date}} at {{time}}* could not be accommodated.\n\nPlease contact us to explore alternative options.\n\nVeto Café & Restaurant 🧡',
         '["customer_name","date","time"]'),
        ('880e8400-e29b-41d4-a716-446655440102', $1, 'reservation_cancelled', 'whatsapp',
         'Hello {{customer_name}},\n\nYour reservation for *{{date}} at {{time}}* has been cancelled as requested.\n\nWe hope to welcome you another time.\n\nVeto Café & Restaurant 🧡',
         '["customer_name","date","time"]')
        ON CONFLICT (tenant_id, name) DO NOTHING
      `, [DEFAULT_TENANT_ID]);
      logger.info('Default message templates created.');
    } else {
      logger.info('Message templates already exist.');
    }
  } catch (err) {
    logger.error('Auto-seed failed', { error: err.message });
  }
};

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed.');
    pool.end(() => {
      logger.info('Database pool closed.');
      process.exit(0);
    });
  });

  // Force shutdown after 10s
  setTimeout(() => {
    logger.error('Forced shutdown due to pending connections.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION:', err);
  server.close(() => process.exit(1));
});

// Start server
const startServer = async () => {
  await autoSeed();
  const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
  });

  return server;
};

startServer();
