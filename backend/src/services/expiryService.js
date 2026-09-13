const Order = require('../models/Order');
const Product = require('../models/Product');
const StockReservation = require('../models/StockReservation');

const expiryService = {
  async cleanupExpiredReservations() {
    const now = new Date();
    const expiredOrders = await Order.find({
      status: 'RESERVED',
      expires_at: { $lte: now }
    }).lean();

    if (!expiredOrders || expiredOrders.length === 0) return 0;

    let count = 0;
    for (const order of expiredOrders) {
      await Order.findOneAndUpdate({ id: order.id }, { status: 'EXPIRED' });

      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product_id, {
          $inc: { reserved_stock: -item.quantity }
        });
      }

      await StockReservation.updateMany({ order_id: order.id }, { status: 'RELEASED' });
      count++;
    }
    return count;
  },

  startBackgroundJob(intervalMs = 5000) {
    console.log(`⏱️ Stock Expiry Cleanup Service active (checking every ${intervalMs / 1000}s)...`);
    setInterval(async () => {
      try {
        const releasedCount = await this.cleanupExpiredReservations();
        if (releasedCount > 0) {
          console.log(`⏳ Auto-expired ${releasedCount} order(s) and released reserved stock.`);
        }
      } catch (err) {
        console.error('Error during stock reservation expiry cleanup:', err.message);
      }
    }, intervalMs);
  }
};

module.exports = expiryService;
