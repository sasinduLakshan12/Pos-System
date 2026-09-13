const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    order_id: { type: String, required: true },
    idempotency_key: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    outcome: {
      type: String,
      required: true,
      enum: ['SUCCESS', 'FAILURE', 'TIMEOUT']
    },
    status: {
      type: String,
      required: true,
      enum: ['COMPLETED', 'FAILED', 'EXPIRED']
    }
  },
  {
    timestamps: { createdAt: 'created_at' }
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
