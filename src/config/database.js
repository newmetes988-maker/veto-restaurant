const { Pool } = require('pg');
const env = require('./env');
const logger = require('../utils/logger');

// Support Render's DATABASE_URL for production
const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL;

const poolConfig = databaseUrl
  ? {
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    }
  : {
      host: env.DB.HOST,
      port: env.DB.PORT,
      database: env.DB.NAME,
      user: env.DB.USER,
      password: env.DB.PASSWORD,
      ssl: env.DB.SSL ? { rejectUnauthorized: false } : false,
      min: env.DB.POOL_MIN,
      max: env.DB.POOL_MAX,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  logger.info('New database connection established');
});

pool.on('error', (err) => {
  logger.error('Unexpected database pool error', err);
  process.exit(-1);
});

/**
 * Execute a query with automatic parameter binding.
 * Usage: db.query('SELECT * FROM users WHERE id = $1', [userId])
 */
const query = async (text, params) => {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  logger.debug('Query executed', { text: text.substring(0, 100), duration, rows: result.rowCount });
  return result;
};

/**
 * Get a client for transactions.
 */
const getClient = async () => {
  const client = await pool.connect();
  const originalQuery = client.query.bind(client);

  client.query = async (text, params) => {
    const start = Date.now();
    const result = await originalQuery(text, params);
    const duration = Date.now() - start;
    logger.debug('Transaction query', { text: text.substring(0, 100), duration, rows: result.rowCount });
    return result;
  };

  return client;
};

/**
 * Execute operations within a transaction.
 * Automatically commits or rolls back.
 */
const withTransaction = async (callback) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  query,
  getClient,
  withTransaction,
};
