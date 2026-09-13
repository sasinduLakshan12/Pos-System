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
const PORT = process.env.PORT || 5000;

// Enable CORS & JSON Body Parsing
app.use(cors());
app.use(express.json());

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

// Start Background 5-Min Stock Lock Expiry Cleanup Ticker
expiryService.startBackgroundJob(5000);

// Initialize Server & Connect MongoDB
(async () => {
  await connectDB();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n==================================================`);
    console.log(`🚀 LOOMPOS BACKEND REST API RUNNING ON PORT ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`==================================================\n`);
  });
})();
