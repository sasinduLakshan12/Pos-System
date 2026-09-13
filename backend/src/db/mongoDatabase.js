const mongoose = require('mongoose');
const Product = require('../models/Product');

const ATLAS_URI = process.env.MONGODB_URI;
const LOCAL_URI = 'mongodb://127.0.0.1:27017/pos-system';

async function connectDB() {
  // 1. Try MongoDB Atlas Cloud if configured
  if (ATLAS_URI && ATLAS_URI.includes('mongodb+srv')) {
    try {
      console.log('Connecting to MongoDB Atlas Cloud...');
      await mongoose.connect(ATLAS_URI, { serverSelectionTimeoutMS: 4000 });
      console.log('🍃 Successfully connected to MongoDB Atlas Cloud!');
      await seedIfEmpty('MongoDB Atlas Cloud');
      return;
    } catch (err) {
      console.warn(`⚠️ MongoDB Atlas Cloud unreachable (${err.message}). Connecting to Local MongoDB...`);
    }
  }

  // 2. Fallback to Local MongoDB Server
  try {
    console.log('Connecting to Local MongoDB (127.0.0.1:27017)...');
    await mongoose.connect(LOCAL_URI, { serverSelectionTimeoutMS: 3000 });
    console.log('🍃 Successfully connected to Local MongoDB Server!');
    await seedIfEmpty('Local MongoDB');
  } catch (err) {
    console.error('❌ Local MongoDB Error:', err.message);
  }
}

async function seedIfEmpty(sourceName) {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      const seedProducts = [
        { name: 'Wireless Ergonomic Mouse', price: 49.99, stock: 15, reserved_stock: 0 },
        { name: 'Mechanical RGB Keyboard', price: 119.99, stock: 8, reserved_stock: 0 },
        { name: 'UltraWide 34" Monitor', price: 499.99, stock: 3, reserved_stock: 0 },
        { name: 'USB-C Multi-Port Hub', price: 29.99, stock: 25, reserved_stock: 0 },
        { name: 'Noise-Canceling Headphones', price: 199.99, stock: 5, reserved_stock: 0 }
      ];
      await Product.insertMany(seedProducts);
      console.log(`🌱 ${sourceName} database seeded with initial products`);
    }
  } catch (e) {}
}

module.exports = connectDB;
