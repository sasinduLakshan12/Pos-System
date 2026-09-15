const Product = require('../models/Product');
const Order = require('../models/Order');
const StockReservation = require('../models/StockReservation');
const Payment = require('../models/Payment');
const inventoryService = require('./inventoryService');

const orderService = {
  generateOrderId() {
    return 'ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  },

  async createOrderWithReservation({ cartId, items, idempotencyKey }) {
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Cart must contain at least one item');
    }

    const orderId = this.generateOrderId();
    let totalAmount = 0;
    const orderItemsToInsert = [];

    // Atomic Stock Validation & Reservation
    for (const item of items) {
      const { productId, quantity } = item;
      if (!productId || !quantity || quantity <= 0) {
        throw new Error('Invalid item parameters');
      }

      const product = await inventoryService.getProductById(productId);
      if (!product) throw new Error(`Product with ID ${productId} not found`);

      if (product.available_stock < quantity) {
        throw new Error(
          `Insufficient stock for "${product.name}". Requested: ${quantity}, Available: ${product.available_stock}`
        );
      }

      totalAmount += product.price * quantity;
      orderItemsToInsert.push({
        product_id: String(product.id),
        product_name: product.name,
        unit_price: product.price,
        quantity
      });

      // Increment reserved stock in MongoDB
      await Product.findByIdAndUpdate(product.id, {
        $inc: { reserved_stock: quantity }
      });
    }

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const newOrder = await Order.create({
      id: orderId,
      cart_id: cartId || null,
      idempotency_key: idempotencyKey || null,
      total_amount: totalAmount,
      status: 'RESERVED',
      expires_at: expiresAt,
      items: orderItemsToInsert
    });

    for (const item of orderItemsToInsert) {
      await StockReservation.create({
        order_id: orderId,
        product_id: item.product_id,
        quantity: item.quantity,
        status: 'ACTIVE',
        expires_at: expiresAt
      });
    }

    return this.getOrderById(orderId);
  },

  async getOrderById(id) {
    const order = await Order.findOne({ id }).lean();
    if (!order) return null;
    const payments = await Payment.find({ order_id: id }).lean();
    const reservations = await StockReservation.find({ order_id: id }).lean();
    return {
      ...order,
      payments,
      reservations
    };
  },

  async getAllOrders() {
    const orders = await Order.find().sort({ created_at: -1 }).lean();
    return orders;
  },

  async processPayment({ orderId, idempotencyKey, outcome }) {
    if (!['SUCCESS', 'FAILURE', 'TIMEOUT'].includes(outcome)) {
      throw new Error('Invalid payment outcome specified');
    }

    const order = await Order.findOne({ id: orderId });
    if (!order) throw new Error(`Order ${orderId} not found`);

    if (idempotencyKey) {
      const existingPayment = await Payment.findOne({ idempotency_key: idempotencyKey }).lean();
      if (existingPayment) {
        return {
          isDuplicate: true,
          message: 'Duplicate payment request detected and ignored (Idempotency Key reused)',
          order: await this.getOrderById(orderId),
          payment: existingPayment
        };
      }
    }

    if (order.status !== 'RESERVED') {
      throw new Error(
        `Cannot process payment for order in '${order.status}' status. Only 'RESERVED' orders can accept payment.`
      );
    }

    const paymentId = 'PAY-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const keyToUse = idempotencyKey || 'KEY-' + Date.now() + '-' + Math.random();

    if (outcome === 'SUCCESS') {
      order.status = 'PAID';
      await order.save();

      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product_id, {
          $inc: { stock: -item.quantity, reserved_stock: -item.quantity }
        });
      }

      await StockReservation.updateMany({ order_id: orderId }, { status: 'COMMITTED' });
      await Payment.create({
        id: paymentId,
        order_id: orderId,
        idempotency_key: keyToUse,
        amount: order.total_amount,
        outcome: 'SUCCESS',
        status: 'COMPLETED'
      });
    } else if (outcome === 'FAILURE' || outcome === 'TIMEOUT') {
      const statusToSet = outcome === 'FAILURE' ? 'FAILED' : 'EXPIRED';
      order.status = statusToSet;
      await order.save();

      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product_id, {
          $inc: { reserved_stock: -item.quantity }
        });
      }

      await StockReservation.updateMany({ order_id: orderId }, { status: 'RELEASED' });
      await Payment.create({
        id: paymentId,
        order_id: orderId,
        idempotency_key: keyToUse,
        amount: order.total_amount,
        outcome,
        status: statusToSet
      });
    }

    return {
      isDuplicate: false,
      message: `Payment outcome '${outcome}' processed successfully`,
      order: await this.getOrderById(orderId)
    };
  },

  async cancelOrder(orderId) {
    const order = await Order.findOne({ id: orderId });
    if (!order) throw new Error(`Order ${orderId} not found`);

    if (!['PAID', 'RESERVED'].includes(order.status)) {
      throw new Error(`Cannot cancel order with status '${order.status}'`);
    }

    const previousStatus = order.status;
    order.status = 'CANCELLED';
    await order.save();

    if (previousStatus === 'PAID') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product_id, {
          $inc: { stock: item.quantity }
        });
      }
    } else if (previousStatus === 'RESERVED') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product_id, {
          $inc: { reserved_stock: -item.quantity }
        });
      }
      await StockReservation.updateMany({ order_id: orderId }, { status: 'RELEASED' });
    }

    return this.getOrderById(orderId);
  },

  async deleteOrder(orderId) {
    const order = await Order.findOne({ id: orderId });
    if (!order) throw new Error(`Order ${orderId} not found`);

    // If deleting an active RESERVED order, release the reserved stock
    if (order.status === 'RESERVED') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product_id, {
          $inc: { reserved_stock: -item.quantity }
        });
      }
      await StockReservation.updateMany({ order_id: orderId }, { status: 'RELEASED' });
    }

    await Order.findOneAndDelete({ id: orderId });
    await Payment.deleteMany({ order_id: orderId });
    await StockReservation.deleteMany({ order_id: orderId });
    return true;
  },

  async clearAllOrders() {
    // Release any active reservations first
    const reservedOrders = await Order.find({ status: 'RESERVED' });
    for (const order of reservedOrders) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product_id, {
          $inc: { reserved_stock: -item.quantity }
        });
      }
    }

    await Order.deleteMany({});
    await Payment.deleteMany({});
    await StockReservation.deleteMany({});
    return true;
  }
};

module.exports = orderService;
