const crypto = require('node:crypto');
const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');

const router = express.Router();

router.post('/', async (req, res, next) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ message: 'Request body must be a JSON object.' });
  }

  try {
    const { items, totalAmount, deliveryFee, deliveryAddress, paymentMethod } = req.body;
    const otpCode = crypto.randomInt(0, 10000).toString().padStart(4, '0');

    const order = await Order.create({
      items,
      totalAmount,
      deliveryFee,
      deliveryAddress,
      paymentMethod,
      otpCode
    });

    return res.status(201).json({
      message: 'Order created successfully.',
      order
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/verify-otp', async (req, res, next) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ message: 'Request body must be a JSON object.' });
  }

  const { orderId, otpCode } = req.body;

  if (!mongoose.isValidObjectId(orderId)) {
    return res.status(400).json({ message: 'A valid orderId is required.' });
  }

  if (typeof otpCode !== 'string' || !/^\d{4}$/.test(otpCode)) {
    return res.status(400).json({ message: 'otpCode must be exactly 4 digits.' });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.otpCode !== otpCode) {
      return res.status(400).json({ message: 'Incorrect OTP code.' });
    }

    if (order.status === 'Delivered') {
      return res.status(409).json({ message: 'Order has already been delivered.' });
    }

    order.status = 'Delivered';
    await order.save();
    return res.status(200).json({ message: 'OTP verified; order marked delivered.', order });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;