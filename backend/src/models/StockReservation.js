const mongoose = require('mongoose');

const stockReservationSchema = new mongoose.Schema(
  {
    order_id: { type: String, required: true },
    product_id: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      required: true,
      enum: ['ACTIVE', 'RELEASED', 'COMMITTED'],
      default: 'ACTIVE'
    },
    expires_at: { type: Date, required: true }
  },
  {
    timestamps: { createdAt: 'created_at' }
  }
);

module.exports = mongoose.model('StockReservation', stockReservationSchema);
