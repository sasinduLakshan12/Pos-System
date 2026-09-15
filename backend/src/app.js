const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');

const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const expiryService = require('./services/expiryService');
const connectDB = require('./db/mongoDatabase');

const app = express();

// Enable CORS & JSON Body Parsing
app.use(cors());
app.use(express.json());

// Middleware to ensure DB connection & perform lazy stock cleanup on Vercel
app.use(async (req, res, next) => {
  try {
    await connectDB();
    // Perform lazy cleanup on serverless request
    if (process.env.VERCEL) {
      expiryService.cleanupExpiredReservations().catch(() => {});
    }
  } catch (e) {}
  next();
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/orders', paymentRoutes);

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    system: 'LoomPOS Smart Store REST API',
    timestamp: new Date().toISOString()
  });
});

// Start Background 5-Min Stock Lock Expiry Cleanup Ticker (for standalone node servers only)
if (!process.env.VERCEL) {
  expiryService.startBackgroundJob(5000);
}

module.exports = app;
