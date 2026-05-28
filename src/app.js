const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const morgan = require('morgan');

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
// Static Files (QR codes & Menu PDFs)
// ============================
app.use('/qr', express.static('public/qr'));
app.use('/menu', express.static('public/menu'));

// Serve React app for client-side routes
app.use(express.static('client/dist'));

// ============================
// Security Middleware
// ============================
app.use(helmet());
app.use(cors({
  origin: env.NODE_ENV === 'production' ? [/yourdomain\.com$/] : true,
  credentials: true,
}));
app.use(hpp()); // Prevent HTTP Parameter Pollution
app.use(apiLimiter);

// ============================
// Body Parsing & Logging
// ============================
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Morgan for HTTP request logging (use Winston in production)
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

// Direct QR check-in route (used by WhatsApp links & QR scans)
app.get('/api/v1/check-in/:token', reservationController.checkIn);

// Public reservation view by QR (no time check)
app.get('/api/v1/reservations/by-qr/:token', reservationController.getByQR);

// ============================
// React Client-side Routing Fallback
// ============================
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      status: 'fail',
      message: `Cannot ${req.method} ${req.originalUrl} on this server`,
    });
  }
  res.sendFile('index.html', { root: 'client/dist' });
});

// ============================
// Global Error Handler
// ============================
app.use(errorHandler);

module.exports = app;
