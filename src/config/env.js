require('dotenv').config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 3000,

  DB: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: parseInt(process.env.DB_PORT, 10) || 5432,
    NAME: process.env.DB_NAME || 'restaurant_reservations',
    USER: process.env.DB_USER || 'postgres',
    PASSWORD: process.env.DB_PASSWORD || '',
    SSL: process.env.DB_SSL === 'true',
    POOL_MIN: parseInt(process.env.DB_POOL_MIN, 10) || 2,
    POOL_MAX: parseInt(process.env.DB_POOL_MAX, 10) || 10,
  },

  JWT_SECRET: process.env.JWT_SECRET || 'default-insecure-change-me-immediately',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}`,

  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_WHATSAPP_FROM: process.env.TWILIO_WHATSAPP_FROM,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};

module.exports = env;
