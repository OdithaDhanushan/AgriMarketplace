const crypto = require('node:crypto');
const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const { sendOtpEmail } = require('../utils/mailer');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// In-memory store for active OTPs keyed by normalized email
const activeOtps = new Map();

// GET Orders: Returns buyer's orders for Buyers, or delivery orders for Drivers
router.get('/', requireAuth, async (req, res, next) => {
  try {
    if (req.user.role === 'Driver') {
      const driverOrders = await Order.find({
        status: { $in: ['Confirmed', 'Picked up', 'Out for delivery', 'Delivered'] }
      }).sort({ createdAt: -1 });
      return res.status(200).json(driverOrders);
    }

    const orders = await Order.find({ buyerId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error) {
    return next(error);
  }
});

// GET Driver Jobs: List of orders available to deliver
router.get('/driver-jobs', async (req, res, next) => {
  try {
    const jobs = await Order.find({
      status: { $in: ['Pending', 'Confirmed', 'Picked up', 'Out for delivery', 'Delivered'] }
    }).sort({ createdAt: -1 });
    return res.status(200).json(jobs);
  } catch (error) {
    return next(error);
  }
});

// GET Live Status for a single order (used for real-time tracking polling by Buyer)
router.get('/:id/live-status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = mongoose.isValidObjectId(id)
      ? { _id: id }
      : { orderNumber: id.startsWith('#') ? id : `#${id}` };

    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    return res.status(200).json({
      success: true,
      id: order.orderNumber ? order.orderNumber.replace('#', '') : order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      driverName: order.driverName || 'Nimal Perera',
      driverPhone: order.driverPhone || '+94 77 123 4567',
      pickupPhoto: order.pickupPhoto || '',
      otpCode: order.otpCode,
      totalAmount: order.totalAmount,
      deliveryAddress: order.deliveryAddress,
      updatedAt: order.updatedAt || order.createdAt,
    });
  } catch (error) {
    return next(error);
  }
});

// Driver accepts job
router.patch('/:id/accept-job', async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = mongoose.isValidObjectId(id)
      ? { _id: id }
      : { orderNumber: id.startsWith('#') ? id : `#${id}` };

    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.driverId = req.user?._id;
    order.driverName = req.user?.name || 'Nimal Perera';
    order.driverPhone = req.user?.phone || '+94 77 123 4567';
    order.status = 'Picked up';
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Job accepted. Proceed to pickup.',
      order,
    });
  } catch (error) {
    return next(error);
  }
});

// Driver confirms pickup with photo
router.patch('/:id/confirm-pickup', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { pickupPhoto } = req.body || {};
    const query = mongoose.isValidObjectId(id)
      ? { _id: id }
      : { orderNumber: id.startsWith('#') ? id : `#${id}` };

    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (pickupPhoto) {
      order.pickupPhoto = pickupPhoto;
    }
    order.status = 'Out for delivery';
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Pickup confirmed. Navigation started.',
      order,
    });
  } catch (error) {
    return next(error);
  }
});

// Driver completes delivery with customer verification code
router.post('/:id/complete-delivery', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { otpCode } = req.body || {};

    if (!otpCode || typeof otpCode !== 'string' || !/^\d{4}$/.test(otpCode)) {
      return res.status(400).json({ success: false, message: 'Customer verification code must be exactly 4 digits.' });
    }

    const query = mongoose.isValidObjectId(id)
      ? { _id: id }
      : { orderNumber: id.startsWith('#') ? id : `#${id}` };

    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.status === 'Delivered') {
      return res.status(409).json({ success: false, message: 'Order has already been marked delivered.' });
    }

    // Verify against order's actual OTP or master demo codes (4827 / 1234)
    const isMatch = (order.otpCode === otpCode) || otpCode === '4827' || (process.env.NODE_ENV !== 'production' && otpCode === '1234');
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please ask the customer for their 4-digit code shown on their order screen.',
      });
    }

    order.status = 'Delivered';
    order.deliveredAt = new Date();
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Delivery verified and completed successfully!',
      order,
    });
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
      debugOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
    });
  } catch (error) {
    return next(error);
  }
});

// Authorize or verify OTP
router.post('/verify-otp', async (req, res, next) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ success: false, message: 'Request body must be a JSON object.' });
  }

  const { email, otpCode, orderId } = req.body;

  if (typeof email === 'string') {
    const normalizedEmail = email.trim().toLowerCase();
    if (!otpCode || typeof otpCode !== 'string' || !/^\d{4}$/.test(otpCode)) {
      return res.status(400).json({ success: false, message: 'OTP must be exactly 4 digits.' });
    }

    const entry = activeOtps.get(normalizedEmail);
    const isValid = (entry && entry.otp === otpCode && Date.now() <= entry.expiresAt) || (process.env.NODE_ENV !== 'production' && (otpCode === '1234' || otpCode === '4827'));

    if (!isValid) {
      if (entry && Date.now() > entry.expiresAt) {
        activeOtps.delete(normalizedEmail);
        return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
      }
      return res.status(400).json({ success: false, message: 'Invalid OTP code. Please check your email.' });
    }

    return res.status(200).json({ success: true, message: 'OTP verified successfully.' });
  }

  if (orderId) {
    if (typeof otpCode !== 'string' || !/^\d{4}$/.test(otpCode)) {
      return res.status(400).json({ message: 'otpCode must be exactly 4 digits.' });
    }

    try {
      const query = mongoose.isValidObjectId(orderId)
        ? { _id: orderId }
        : { orderNumber: orderId.startsWith('#') ? orderId : `#${orderId}` };

      const order = await Order.findOne(query);
      if (!order) {
        return res.status(404).json({ message: 'Order not found.' });
      }

      const isValid = (order.otpCode === otpCode) || otpCode === '4827' || (process.env.NODE_ENV !== 'production' && otpCode === '1234');
      if (!isValid) {
        return res.status(400).json({ message: 'Incorrect OTP code.' });
      }

      if (order.status === 'Delivered') {
        return res.status(409).json({ message: 'Order has already been delivered.' });
      }

      order.status = 'Delivered';
      order.deliveredAt = new Date();
      await order.save();
      return res.status(200).json({ message: 'OTP verified; order marked delivered.', order });
    } catch (error) {
      return next(error);
    }
  }

  return res.status(400).json({ success: false, message: 'Either email or valid orderId is required.' });
});

// Create Order (Buyer)
router.post('/', requireAuth, async (req, res, next) => {
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
      email
    } = req.body;

    const formattedItems = (Array.isArray(items) ? items : []).map((item) => ({
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

    const finalOrderNumber = orderNumber || (id ? (String(id).startsWith('#') ? String(id) : `#${id}`) : undefined);
    const providedEmail = typeof userEmail === 'string'
      ? userEmail
      : typeof email === 'string'
        ? email
        : req.user.email;
    const finalEmail = providedEmail ? providedEmail.trim().toLowerCase() : '';

    const orderData = {
      buyerId: req.user._id,
      items: formattedItems,
      totalAmount: Number(totalAmount ?? total ?? 0),
      deliveryFee: Number(deliveryFee ?? 0),
      deliveryAddress: deliveryAddress || '24 Flower Road, Colombo 07',
      paymentMethod: paymentMethod || 'Cash on Delivery',
      userEmail: finalEmail,
      otpCode: finalOtp,
      driverName: 'Nimal Perera',
      driverPhone: '+94 77 123 4567',
      status: 'Confirmed'
    };

    if (finalOrderNumber) {
      orderData.orderNumber = finalOrderNumber;
    }

    const order = await Order.create(orderData);

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