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
const messageTemplateRoutes = require('./routes/messageTemplate.routes');
const uploadRoutes = require('./routes/upload.routes');
const eventRoutes = require('./routes/event.routes');
const offerRoutes = require('./routes/offer.routes');
const reviewRoutes = require('./routes/review.routes');
const settingRoutes = require('./routes/setting.routes');
const adminUserRoutes = require('./routes/adminUser.routes');
const reservationController = require('./controllers/reservation.controller');
const { migrate } = require('./controllers/migrate.controller');

const app = express();

// ============================
// Static Files (QR codes & Menu PDFs)
// ============================
const publicQrPath = path.resolve(__dirname, '..', 'public/qr');
const publicMenuPath = path.resolve(__dirname, '..', 'public/menu');
const publicUploadsPath = path.resolve(__dirname, '..', 'public/uploads');
const clientDistPath = path.resolve(__dirname, '..', 'client/dist');

if (fs.existsSync(publicQrPath)) {
  app.use('/qr', express.static(publicQrPath));
}
if (fs.existsSync(publicMenuPath)) {
  app.use('/menu', express.static(publicMenuPath));
}
if (fs.existsSync(publicUploadsPath)) {
  app.use('/uploads', express.static(publicUploadsPath));
}

// Serve React app for client-side routes
const hasClientBuild = fs.existsSync(path.join(clientDistPath, 'index.html'));
if (hasClientBuild) {
  app.use(express.static(clientDistPath));
  logger.info('Serving React app from client/dist');
} else {
  logger.warn('client/dist/index.html not found. Run: cd client && npm install && npm run build');
}

// ============================
// Security Middleware
// ============================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
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
// Migration endpoint (one-time, creates missing tables)
// ============================
app.get('/migrate', migrate);

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
app.use('/api/v1/admin/templates', messageTemplateRoutes);
app.use('/api/v1/admin/upload', uploadRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/offers', offerRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/settings', settingRoutes);
app.use('/api/v1/admin/users', adminUserRoutes);

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
  if (hasClientBuild) {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  } else {
    res.status(503).send(`
      <html><body style="background:#050505;color:#d4af37;font-family:sans-serif;text-align:center;padding-top:20vh">
        <h1>Veto API is running</h1>
        <p style="color:#666">Frontend build not found.</p>
        <p style="color:#888;font-size:14px">Build Command: cd client && npm install && npm run build</p>
      </body></html>
    `);
  }
});

// ============================
// Global Error Handler
// ============================
app.use(errorHandler);

module.exports = app;
