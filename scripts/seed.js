const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/database');
const logger = require('../src/utils/logger');

const seed = async () => {
  try {
    const checkResult = await pool.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tenants')"
    );

    if (checkResult.rows[0].exists) {
      logger.info('Database already seeded. Skipping.');
      return;
    }

    logger.info('Seeding database for the first time...');

    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    await pool.query(schema);

    logger.info('Database seeded successfully!');
  } catch (err) {
    logger.error('Seed failed', { error: err.message });
    process.exit(1);
  } finally {
    await pool.end();
  }
};

seed();
