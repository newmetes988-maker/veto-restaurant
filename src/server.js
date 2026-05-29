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

    // Ensure events table exists (for existing DBs that don't have it)
    const eventsTableCheck = await pool.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'events')"
    );
    if (!eventsTableCheck.rows[0].exists) {
      logger.info('Creating events, offers, reviews tables...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS events (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          image_url VARCHAR(500),
          event_date DATE NOT NULL,
          event_time TIME,
          location VARCHAR(255),
          max_capacity INT DEFAULT 0,
          price DECIMAL(10,2) DEFAULT 0,
          is_featured BOOLEAN DEFAULT false,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_events_tenant ON events(tenant_id);
        CREATE INDEX IF NOT EXISTS idx_events_date ON events(tenant_id, event_date);

        CREATE TABLE IF NOT EXISTS offers (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          discount_percent INT DEFAULT 0,
          discount_amount DECIMAL(10,2) DEFAULT 0,
          code VARCHAR(50),
          image_url VARCHAR(500),
          start_date DATE,
          end_date DATE,
          terms TEXT,
          is_featured BOOLEAN DEFAULT false,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_offers_tenant ON offers(tenant_id);

        CREATE TABLE IF NOT EXISTS reviews (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
          customer_name VARCHAR(255) NOT NULL,
          rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
          comment TEXT,
          is_approved BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_reviews_tenant ON reviews(tenant_id);
        CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(tenant_id, is_approved, created_at DESC);
      `);
      logger.info('Events, offers, reviews tables created.');
    }

    // Seed sample events if empty
    const eventsCount = await pool.query('SELECT COUNT(*) as count FROM events WHERE tenant_id = $1', [DEFAULT_TENANT_ID]);
    if (parseInt(eventsCount.rows[0].count, 10) === 0) {
      await pool.query(`
        INSERT INTO events (id, tenant_id, title, description, image_url, event_date, event_time, location, max_capacity, price, is_featured, is_active) VALUES
        ('990e8400-e29b-41d4-a716-446655440200', $1, 'Live Jazz Night', 'An enchanting evening of smooth jazz performed by local artists. Perfect for a romantic dinner.', '/images/hero.png', CURRENT_DATE + INTERVAL '7 days', '20:00', 'Main Dining Hall', 60, 250, true, true),
        ('990e8400-e29b-41d4-a716-446655440201', $1, 'Sushi Masterclass', 'Learn the art of sushi making from our executive chef. Includes tasting menu and certificate.', '/images/hero.png', CURRENT_DATE + INTERVAL '14 days', '18:00', 'Open Kitchen', 20, 450, true, true),
        ('990e8400-e29b-41d4-a716-446655440202', $1, 'Sunset Rooftop Party', 'Enjoy crafted cocktails and tapas with a breathtaking view of the Mediterranean.', '/images/hero.png', CURRENT_DATE + INTERVAL '21 days', '17:00', 'Rooftop Terrace', 80, 150, false, true)
      `, [DEFAULT_TENANT_ID]);
      logger.info('Sample events created.');
    }

    // Seed sample offers if empty
    const offersCount = await pool.query('SELECT COUNT(*) as count FROM offers WHERE tenant_id = $1', [DEFAULT_TENANT_ID]);
    if (parseInt(offersCount.rows[0].count, 10) === 0) {
      await pool.query(`
        INSERT INTO offers (id, tenant_id, title, description, discount_percent, code, image_url, start_date, end_date, terms, is_featured, is_active) VALUES
        ('990e8400-e29b-41d4-a716-446655440300', $1, 'Weekend Special', 'Get 30% off your total bill every Friday & Saturday. Perfect for family gatherings!', 30, 'WEEKEND30', '/images/hero.png', CURRENT_DATE, CURRENT_DATE + INTERVAL '6 months', 'Valid on Fridays and Saturdays only. Min spend 500 EGP.', true, true),
        ('990e8400-e29b-41d4-a716-446655440301', $1, 'Sushi Lovers Combo', 'Buy any 2 sushi rolls and get the 3rd one free. Mix and match your favorites!', 33, 'SUSHI3FOR2', '/images/hero.png', CURRENT_DATE, CURRENT_DATE + INTERVAL '3 months', 'Lowest priced roll is free. Cannot be combined with other offers.', true, true),
        ('990e8400-e29b-41d4-a716-446655440302', $1, 'Happy Hour', '50% off all mocktails and juices from 3PM to 6PM daily. Beat the heat!', 50, 'HAPPY50', '/images/hero.png', CURRENT_DATE, CURRENT_DATE + INTERVAL '6 months', 'Valid 3:00 PM - 6:00 PM daily. Dine-in only.', false, true)
      `, [DEFAULT_TENANT_ID]);
      logger.info('Sample offers created.');
    }

    // Seed sample reviews if empty
    const reviewsCount = await pool.query('SELECT COUNT(*) as count FROM reviews WHERE tenant_id = $1', [DEFAULT_TENANT_ID]);
    if (parseInt(reviewsCount.rows[0].count, 10) === 0) {
      await pool.query(`
        INSERT INTO reviews (id, tenant_id, customer_name, rating, comment, is_approved) VALUES
        ('990e8400-e29b-41d4-a716-446655440400', $1, 'Ahmed Hassan', 5, 'Absolutely stunning experience! The ambiance was perfect for our anniversary dinner. The sushi was the best I have had in Alexandria.', true),
        ('990e8400-e29b-41d4-a716-446655440401', $1, 'Sarah Mitchell', 5, 'The live jazz night was magical. Amazing food, great cocktails, and the staff made us feel like royalty. Will definitely be back!', true),
        ('990e8400-e29b-41d4-a716-446655440402', $1, 'Omar Khalil', 4, 'Great place for a business lunch. The Spanish Latte is a must-try. Service was a bit slow but the food quality made up for it.', true),
        ('990e8400-e29b-41d4-a716-446655440403', $1, 'Layla Farouk', 5, 'I attended the sushi masterclass and it was incredible! The chef was so patient and knowledgeable. Highly recommend.', true)
      `, [DEFAULT_TENANT_ID]);
      logger.info('Sample reviews created.');
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
