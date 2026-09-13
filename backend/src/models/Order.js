const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product_id: { type: String, required: true },
  product_name: { type: String, required: true },
  unit_price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 }
});

const orderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    cart_id: { type: String, default: null },
    idempotency_key: { type: String, default: null, sparse: true },
    total_amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      required: true,
      enum: ['PENDING', 'RESERVED', 'PAID', 'CANCELLED', 'EXPIRED', 'FAILED'],
      default: 'RESERVED'
    },
    expires_at: { type: Date, required: true },
    items: [orderItemSchema]
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

module.exports = mongoose.model('Order', orderSchema);
