const crypto = require('node:crypto');
const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const { sendOtpEmail } = require('../utils/mailer');

const router = express.Router();

// In-memory store for active OTPs keyed by normalized email
const activeOtps = new Map();

router.get('/', async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error) {
    return next(error);
  }
});

// Endpoint to send OTP to user's login/notification email
router.post('/send-otp', async (req, res, next) => {
  try {
    const { email, orderNumber } = req.body || {};
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    // Generate a secure 4-digit OTP
    const otp = crypto.randomInt(1000, 10000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    activeOtps.set(normalizedEmail, {
      otp,
      expiresAt,
      orderNumber: orderNumber || 'AGRI'
    });

    // Send email asynchronously
    const sendResult = await sendOtpEmail({
      to: normalizedEmail,
      otp,
      orderNumber: orderNumber || 'AGRI',
    });

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${normalizedEmail}`,
      email: normalizedEmail,
      previewUrl: sendResult?.previewUrl,
      // debugOtp returned in non-production for easy verification
      debugOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
    });
  } catch (error) {
    return next(error);
  }
});

// Endpoint to verify OTP
router.post('/verify-otp', async (req, res, next) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ success: false, message: 'Request body must be a JSON object.' });
  }

  const { email, otpCode, orderId } = req.body;

  // Case 1: Verification by Email before/during order confirmation
  if (email) {
    const normalizedEmail = email.trim().toLowerCase();
    if (!otpCode || typeof otpCode !== 'string' || !/^\d{4}$/.test(otpCode)) {
      return res.status(400).json({ success: false, message: 'OTP must be exactly 4 digits.' });
    }

    const entry = activeOtps.get(normalizedEmail);
    // Allow master test code '1234' in development if needed
    const isValid = (entry && entry.otp === otpCode && Date.now() <= entry.expiresAt) || (process.env.NODE_ENV !== 'production' && otpCode === '1234');

    if (!isValid) {
      if (entry && Date.now() > entry.expiresAt) {
        activeOtps.delete(normalizedEmail);
        return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
      }
      return res.status(400).json({ success: false, message: 'Invalid OTP code. Please check your email.' });
    }

    // OTP is valid
    return res.status(200).json({ success: true, message: 'OTP verified successfully.' });
  }

  // Case 2: Verification by orderId (for post-delivery verification)
  if (orderId && mongoose.isValidObjectId(orderId)) {
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
  }

  return res.status(400).json({ success: false, message: 'Either email or valid orderId is required.' });
});

router.post('/', async (req, res, next) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ message: 'Request body must be a JSON object.' });
  }

  try {
    const {
      items,
      totalAmount,
      total,
      deliveryFee,
      deliveryAddress,
      paymentMethod,
      orderNumber,
      id,
      otpCode,
      userEmail,
      email,
      status
    } = req.body;

    const formattedItems = (items || []).map((item) => ({
      productName: item.productName || item.name || item.cropName || 'Fresh Item',
      name: item.name || item.cropName || item.productName || 'Fresh Item',
      quantity: Number(item.quantity) || 1,
      pricePerKg: Number(item.pricePerKg || item.unitPrice || item.price || 0),
      unitPrice: Number(item.unitPrice || item.pricePerKg || item.price || 0),
      unit: item.unit || 'kg',
      image: item.image || item.photoUrl || '',
      farmer: item.farmer || ''
    }));

    const finalOtp = (typeof otpCode === 'string' && /^\d{4}$/.test(otpCode))
      ? otpCode
      : crypto.randomInt(1000, 10000).toString();

    const finalOrderNumber = orderNumber || (id ? (id.startsWith('#') ? id : `#${id}`) : undefined);
    const finalEmail = (userEmail || email || '').trim().toLowerCase();

    const orderData = {
      items: formattedItems,
      totalAmount: Number(totalAmount ?? total ?? 0),
      deliveryFee: Number(deliveryFee ?? 0),
      deliveryAddress: deliveryAddress || '24 Flower Road, Colombo 07',
      paymentMethod: paymentMethod || 'Cash on Delivery',
      userEmail: finalEmail,
      otpCode: finalOtp,
      status: status || 'Confirmed'
    };

    if (finalOrderNumber) {
      orderData.orderNumber = finalOrderNumber;
    }

    const order = await Order.create(orderData);

    // Clean up active OTP for this email once order is confirmed
    if (finalEmail) {
      activeOtps.delete(finalEmail);
    }

    return res.status(201).json({
      message: 'Order created successfully.',
      order
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;