const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    reserved_stock: { type: Number, required: true, min: 0, default: 0 }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field for available_stock = stock - reserved_stock
productSchema.virtual('available_stock').get(function () {
  return Math.max(0, this.stock - this.reserved_stock);
});

module.exports = mongoose.model('Product', productSchema);
