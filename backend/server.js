require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./src/config/db');
const passport = require('./src/config/passport');

const authRoutes = require('./src/routes/auth');
const productRoutes = require('./src/routes/products');
const templateRoutes = require('./src/routes/templates');
const presetVideoRoutes = require('./src/routes/presetVideos');
const orderRoutes = require('./src/routes/orders');
const paymentRoutes = require('./src/routes/payments');
const arRoutes = require('./src/routes/ar');

const app = express();

// Trust proxy (required for Render/Heroku/etc)
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// Passport (no session — JWT only)
app.use(passport.initialize());

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS — allow localhost in dev, and any *.vercel.app preview + production URL
const corsOrigin = (origin, callback) => {
  if (!origin) return callback(null, true); // server-to-server / curl
  if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
  const allowed = (process.env.FRONTEND_URL || '').split(',').map(s => s.trim()).filter(Boolean);
  if (allowed.includes(origin)) return callback(null, true);
  if (/^https:\/\/[a-z0-9-]+-[a-z0-9]+-[a-z0-9-]+\.vercel\.app$/.test(origin)) return callback(null, true);
  if (/^https:\/\/ar-gift-website.*\.vercel\.app$/.test(origin)) return callback(null, true);
  callback(new Error('Not allowed by CORS'));
};

app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve locally uploaded files (used when Cloudinary is not configured)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root + Health check
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'AR Gift API', version: '1.0.0', docs: '/health' });
});
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'AR Gift API is running', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/preset-videos', presetVideoRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ar', arRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global Error:', err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ success: false, message: `${field} already exists.` });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired.' });
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File size exceeds the limit.' });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 AR Gift API Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}/api\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err.message);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

module.exports = app;
