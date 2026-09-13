const express = require('express');
const router = express.Router();
const orderService = require('../services/orderService');

// POST /api/orders/:id/payment - Process payment simulation outcome with idempotency
router.post('/:id/payment', async (req, res) => {
  try {
    const orderId = req.params.id;
    const { outcome, idempotencyKey } = req.body;

    if (!outcome) {
      return res.status(400).json({ success: false, error: "Field 'outcome' (SUCCESS, FAILURE, TIMEOUT) is required" });
    }

    const result = await orderService.processPayment({ orderId, idempotencyKey, outcome });

    if (result.isDuplicate) {
      return res.status(200).json({
        success: true,
        duplicate: true,
        message: result.message,
        data: result.order
      });
    }

    res.json({
      success: true,
      duplicate: false,
      message: result.message,
      data: result.order
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
