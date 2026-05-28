const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const env = require('./config/env');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const reservationRoutes = require('./routes/reservation.routes');
const adminRoutes = require('./routes/admin.routes');
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const adminProductRoutes = require('./routes/admin.product.routes');
const categoryRoutes = require('./routes/category.routes');
const adminCategoryRoutes = require('./routes/admin.category.routes');
const reservationController = require('./controllers/reservation.controller');

const app = express();

// ============================
// CORS - Allow all origins (for frontend on Vercel)
// ============================
app.use(cors({
  origin: true,
  credentials: true,
}));

// ============================
// Static Files (QR codes & Menu PDFs)
// ============================
const publicQrPath = path.resolve(__dirname, '..', 'public/qr');
const publicMenuPath = path.resolve(__dirname, '..', 'public/menu');

if (fs.existsSync(publicQrPath)) {
  app.use('/qr', express.static(publicQrPath));
}
if (fs.existsSync(publicMenuPath)) {
  app.use('/menu', express.static(publicMenuPath));
}

// ============================
// Security Middleware
// ============================
app.use(helmet());
app.use(hpp());
app.use(apiLimiter);

// ============================
// Body Parsing & Logging
// ============================
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

const morganFormat = env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: { write: (message) => logger.info(message.trim()) },
}));

// ============================
// Health Check
// ============================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'up',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ============================
// API Routes
// ============================
app.use('/api/v1/reservations', reservationRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/admin/products', adminProductRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/admin/categories', adminCategoryRoutes);

// Direct QR check-in route
app.get('/api/v1/check-in/:token', reservationController.checkIn);

// Public reservation view by QR
app.get('/api/v1/reservations/by-qr/:token', reservationController.getByQR);

// ============================
// 404 Handler
// ============================
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// ============================
// Global Error Handler
// ============================
app.use(errorHandler);

module.exports = app;
