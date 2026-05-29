const { pool } = require('../config/database');
const logger = require('../utils/logger');

const DEFAULT_TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

const migrate = async (req, res) => {
  try {
    // Create events table
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
      )
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_events_tenant ON events(tenant_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_events_date ON events(tenant_id, event_date)');

    // Create offers table
    await pool.query(`
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
      )
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_offers_tenant ON offers(tenant_id)');

    // Create reviews table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        customer_name VARCHAR(255) NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        is_approved BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_reviews_tenant ON reviews(tenant_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(tenant_id, is_approved, created_at DESC)');

    // Seed events
    const eventsCount = await pool.query('SELECT COUNT(*) as count FROM events WHERE tenant_id = $1', [DEFAULT_TENANT_ID]);
    if (parseInt(eventsCount.rows[0].count, 10) === 0) {
      await pool.query(`
        INSERT INTO events (id, tenant_id, title, description, image_url, event_date, event_time, location, max_capacity, price, is_featured, is_active) VALUES
        ('990e8400-e29b-41d4-a716-446655440200', $1, 'Live Jazz Night', 'An enchanting evening of smooth jazz performed by local artists. Perfect for a romantic dinner.', '/images/hero.png', CURRENT_DATE + INTERVAL '7 days', '20:00', 'Main Dining Hall', 60, 250, true, true),
        ('990e8400-e29b-41d4-a716-446655440201', $1, 'Sushi Masterclass', 'Learn the art of sushi making from our executive chef. Includes tasting menu and certificate.', '/images/hero.png', CURRENT_DATE + INTERVAL '14 days', '18:00', 'Open Kitchen', 20, 450, true, true),
        ('990e8400-e29b-41d4-a716-446655440202', $1, 'Sunset Rooftop Party', 'Enjoy crafted cocktails and tapas with a breathtaking view of the Mediterranean.', '/images/hero.png', CURRENT_DATE + INTERVAL '21 days', '17:00', 'Rooftop Terrace', 80, 150, false, true)
      `, [DEFAULT_TENANT_ID]);
    }

    // Seed offers
    const offersCount = await pool.query('SELECT COUNT(*) as count FROM offers WHERE tenant_id = $1', [DEFAULT_TENANT_ID]);
    if (parseInt(offersCount.rows[0].count, 10) === 0) {
      await pool.query(`
        INSERT INTO offers (id, tenant_id, title, description, discount_percent, code, image_url, start_date, end_date, terms, is_featured, is_active) VALUES
        ('990e8400-e29b-41d4-a716-446655440300', $1, 'Weekend Special', 'Get 30% off your total bill every Friday & Saturday. Perfect for family gatherings!', 30, 'WEEKEND30', '/images/hero.png', CURRENT_DATE, CURRENT_DATE + INTERVAL '6 months', 'Valid on Fridays and Saturdays only. Min spend 500 EGP.', true, true),
        ('990e8400-e29b-41d4-a716-446655440301', $1, 'Sushi Lovers Combo', 'Buy any 2 sushi rolls and get the 3rd one free. Mix and match your favorites!', 33, 'SUSHI3FOR2', '/images/hero.png', CURRENT_DATE, CURRENT_DATE + INTERVAL '3 months', 'Lowest priced roll is free. Cannot be combined with other offers.', true, true),
        ('990e8400-e29b-41d4-a716-446655440302', $1, 'Happy Hour', '50% off all mocktails and juices from 3PM to 6PM daily. Beat the heat!', 50, 'HAPPY50', '/images/hero.png', CURRENT_DATE, CURRENT_DATE + INTERVAL '6 months', 'Valid 3:00 PM - 6:00 PM daily. Dine-in only.', false, true)
      `, [DEFAULT_TENANT_ID]);
    }

    // Seed reviews
    const reviewsCount = await pool.query('SELECT COUNT(*) as count FROM reviews WHERE tenant_id = $1', [DEFAULT_TENANT_ID]);
    if (parseInt(reviewsCount.rows[0].count, 10) === 0) {
      await pool.query(`
        INSERT INTO reviews (id, tenant_id, customer_name, rating, comment, is_approved) VALUES
        ('990e8400-e29b-41d4-a716-446655440400', $1, 'Ahmed Hassan', 5, 'Absolutely stunning experience! The ambiance was perfect for our anniversary dinner. The sushi was the best I have had in Alexandria.', true),
        ('990e8400-e29b-41d4-a716-446655440401', $1, 'Sarah Mitchell', 5, 'The live jazz night was magical. Amazing food, great cocktails, and the staff made us feel like royalty. Will definitely be back!', true),
        ('990e8400-e29b-41d4-a716-446655440402', $1, 'Omar Khalil', 4, 'Great place for a business lunch. The Spanish Latte is a must-try. Service was a bit slow but the food quality made up for it.', true),
        ('990e8400-e29b-41d4-a716-446655440403', $1, 'Layla Farouk', 5, 'I attended the sushi masterclass and it was incredible! The chef was so patient and knowledgeable. Highly recommend.', true)
      `, [DEFAULT_TENANT_ID]);
    }

    logger.info('Migration completed successfully');
    res.status(200).json({ status: 'success', message: 'Migration completed successfully' });
  } catch (err) {
    logger.error('Migration failed', { error: err.message, stack: err.stack });
    res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports = { migrate };
