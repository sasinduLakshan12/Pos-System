const express = require('express');
const router = express.Router();
const orderService = require('../services/orderService');

// POST /api/orders - Create Order & Reserve Stock (Checkout)
router.post('/', async (req, res) => {
  try {
    const { cartId, items, idempotencyKey } = req.body;
    const order = await orderService.createOrderWithReservation({ cartId, items, idempotencyKey });
    res.status(201).json({ success: true, message: 'Stock reserved & order created successfully', data: order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/orders - Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/orders/:id - Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/orders/:id/cancel - Cancel order and restore stock
router.post('/:id/cancel', async (req, res) => {
  try {
    const cancelledOrder = await orderService.cancelOrder(req.params.id);
    res.json({ success: true, message: 'Order cancelled and stock restored successfully', data: cancelledOrder });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
