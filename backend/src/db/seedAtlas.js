const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');

async function seedAtlas() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    console.log('URI:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ CONNECTED TO MONGODB ATLAS!');

    const seedProducts = [
      { name: 'Wireless Ergonomic Mouse', price: 49.99, stock: 15, reserved_stock: 0 },
      { name: 'Mechanical RGB Keyboard', price: 119.99, stock: 8, reserved_stock: 0 },
      { name: 'UltraWide 34" Monitor', price: 499.99, stock: 3, reserved_stock: 0 },
      { name: 'USB-C Multi-Port Hub', price: 29.99, stock: 25, reserved_stock: 0 },
      { name: 'Noise-Canceling Headphones', price: 199.99, stock: 5, reserved_stock: 0 }
    ];

    await Product.deleteMany({});
    await Product.insertMany(seedProducts);
    console.log('🏆 SUCCESS! pos-system database created and seeded in MongoDB Atlas!');
    process.exit(0);
  } catch (err) {
    console.error('❌ ATLAS SEED ERROR:', err.message);
    process.exit(1);
  }
}

seedAtlas();
