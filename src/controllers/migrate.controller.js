const { pool } = require('../config/database');
const logger = require('../utils/logger');

const DEFAULT_TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

const runQuery = async (sql, params = []) => {
  try {
    await pool.query(sql, params);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const migrate = async (req, res) => {
  const results = [];

  // 1. Create events table
  const eventsTable = await runQuery(`
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
  results.push({ step: 'Create events table', ...eventsTable });

  await runQuery('CREATE INDEX IF NOT EXISTS idx_events_tenant ON events(tenant_id)');
  await runQuery('CREATE INDEX IF NOT EXISTS idx_events_date ON events(tenant_id, event_date)');

  // 2. Create offers table
  const offersTable = await runQuery(`
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
  results.push({ step: 'Create offers table', ...offersTable });

  await runQuery('CREATE INDEX IF NOT EXISTS idx_offers_tenant ON offers(tenant_id)');

  // 3. Create reviews table
  const reviewsTable = await runQuery(`
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
  results.push({ step: 'Create reviews table', ...reviewsTable });

  await runQuery('CREATE INDEX IF NOT EXISTS idx_reviews_tenant ON reviews(tenant_id)');
  await runQuery('CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(tenant_id, is_approved, created_at DESC)');

  // 4. Create settings table
  const settingsTable = await runQuery(`
    CREATE TABLE IF NOT EXISTS settings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      social_links JSONB DEFAULT '{}',
      contact_phones JSONB DEFAULT '[]',
      contact_email VARCHAR(255),
      address TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(tenant_id)
    )
  `);
  results.push({ step: 'Create settings table', ...settingsTable });

  await runQuery('CREATE INDEX IF NOT EXISTS idx_settings_tenant ON settings(tenant_id)');

  // 4. Seed events
  const eventsSeed = await runQuery(`
    INSERT INTO events (id, tenant_id, title, description, image_url, event_date, event_time, location, max_capacity, price, is_featured, is_active) VALUES
    ('990e8400-e29b-41d4-a716-446655440200', $1, 'Live Jazz Night', 'An enchanting evening of smooth jazz performed by local artists. Perfect for a romantic dinner.', '/images/hero.png', CURRENT_DATE + INTERVAL '7 days', '20:00', 'Main Dining Hall', 60, 250, true, true),
    ('990e8400-e29b-41d4-a716-446655440201', $1, 'Sushi Masterclass', 'Learn the art of sushi making from our executive chef. Includes tasting menu and certificate.', '/images/hero.png', CURRENT_DATE + INTERVAL '14 days', '18:00', 'Open Kitchen', 20, 450, true, true),
    ('990e8400-e29b-41d4-a716-446655440202', $1, 'Sunset Rooftop Party', 'Enjoy crafted cocktails and tapas with a breathtaking view of the Mediterranean.', '/images/hero.png', CURRENT_DATE + INTERVAL '21 days', '17:00', 'Rooftop Terrace', 80, 150, false, true)
    ON CONFLICT DO NOTHING
  `, [DEFAULT_TENANT_ID]);
  results.push({ step: 'Seed events', ...eventsSeed });

  // 5. Seed offers
  const offersSeed = await runQuery(`
    INSERT INTO offers (id, tenant_id, title, description, discount_percent, code, image_url, start_date, end_date, terms, is_featured, is_active) VALUES
    ('990e8400-e29b-41d4-a716-446655440300', $1, 'Weekend Special', 'Get 30% off your total bill every Friday & Saturday. Perfect for family gatherings!', 30, 'WEEKEND30', '/images/hero.png', CURRENT_DATE, CURRENT_DATE + INTERVAL '6 months', 'Valid on Fridays and Saturdays only. Min spend 500 EGP.', true, true),
    ('990e8400-e29b-41d4-a716-446655440301', $1, 'Sushi Lovers Combo', 'Buy any 2 sushi rolls and get the 3rd one free. Mix and match your favorites!', 33, 'SUSHI3FOR2', '/images/hero.png', CURRENT_DATE, CURRENT_DATE + INTERVAL '3 months', 'Lowest priced roll is free. Cannot be combined with other offers.', true, true),
    ('990e8400-e29b-41d4-a716-446655440302', $1, 'Happy Hour', '50% off all mocktails and juices from 3PM to 6PM daily. Beat the heat!', 50, 'HAPPY50', '/images/hero.png', CURRENT_DATE, CURRENT_DATE + INTERVAL '6 months', 'Valid 3:00 PM - 6:00 PM daily. Dine-in only.', false, true)
    ON CONFLICT DO NOTHING
  `, [DEFAULT_TENANT_ID]);
  results.push({ step: 'Seed offers', ...offersSeed });

  // 6. Seed reviews
  const reviewsSeed = await runQuery(`
    INSERT INTO reviews (id, tenant_id, customer_name, rating, comment, is_approved) VALUES
    ('990e8400-e29b-41d4-a716-446655440400', $1, 'Ahmed Hassan', 5, 'Absolutely stunning experience! The ambiance was perfect for our anniversary dinner. The sushi was the best I have had in Alexandria.', true),
    ('990e8400-e29b-41d4-a716-446655440401', $1, 'Sarah Mitchell', 5, 'The live jazz night was magical. Amazing food, great cocktails, and the staff made us feel like royalty. Will definitely be back!', true),
    ('990e8400-e29b-41d4-a716-446655440402', $1, 'Omar Khalil', 4, 'Great place for a business lunch. The Spanish Latte is a must-try. Service was a bit slow but the food quality made up for it.', true),
    ('990e8400-e29b-41d4-a716-446655440403', $1, 'Layla Farouk', 5, 'I attended the sushi masterclass and it was incredible! The chef was so patient and knowledgeable. Highly recommend.', true)
    ON CONFLICT DO NOTHING
  `, [DEFAULT_TENANT_ID]);
  results.push({ step: 'Seed reviews', ...reviewsSeed });

  // 7. Seed settings
  const settingsSeed = await runQuery(`
    INSERT INTO settings (id, tenant_id, social_links, contact_phones, contact_email, address) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', $1,
     '{"facebook":"https://www.facebook.com/VetoLounge/?locale=ar_AR","twitter":"","tiktok":"https://www.tiktok.com/@veto.restaurant.cafe","instagram":"https://www.instagram.com/veto.cafe/?hl=ar","custom":[]}',
     '["01050101097","01050101098"]',
     'hello@veto.restaurant',
     'Gleembay / Montaza, Alexandria')
    ON CONFLICT DO NOTHING
  `, [DEFAULT_TENANT_ID]);
  results.push({ step: 'Seed settings', ...settingsSeed });

  const hasErrors = results.some((r) => !r.success);
  logger.info('Migration completed', { results });

  res.status(hasErrors ? 500 : 200).json({
    status: hasErrors ? 'error' : 'success',
    message: hasErrors ? 'Some migration steps failed' : 'Migration completed successfully',
    results,
  });
};

module.exports = { migrate };
