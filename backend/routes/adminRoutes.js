const express = require('express');
const User = require('../models/User');
const Produce = require('../models/Produce');
const Order = require('../models/Order');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Protect all admin routes with authentication and Admin role verification
router.use(requireAuth, requireRole('Admin'));

// 1. System Metrics & Progress Overview
router.get('/metrics', async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalFarmers,
      totalBuyers,
      totalAdmins,
      totalProduce,
      stockAggregate,
      totalOrders,
      revenueAggregate,
      recentOrders,
      recentUsers,
      statusCounts
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'Farmer' }),
      User.countDocuments({ role: 'Buyer' }),
      User.countDocuments({ role: 'Admin' }),
      Produce.countDocuments(),
      Produce.aggregate([{ $group: { _id: null, totalKg: { $sum: '$quantityKg' } } }]),
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }]),
      Order.find().sort({ createdAt: -1 }).limit(6).populate('buyerId', 'name email phone'),
      User.find().sort({ createdAt: -1 }).limit(6).select('-passwordHash'),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    const totalStockKg = stockAggregate[0]?.totalKg || 0;
    const totalRevenue = revenueAggregate[0]?.totalRevenue || 0;

    const statusBreakdown = {
      Confirmed: 0,
      Processing: 0,
      'Out for Delivery': 0,
      Delivered: 0,
      Cancelled: 0,
    };
    statusCounts.forEach((item) => {
      if (item._id) {
        statusBreakdown[item._id] = item.count;
      }
    });

    return res.status(200).json({
      summary: {
        totalUsers,
        totalFarmers,
        totalBuyers,
        totalAdmins,
        totalProduce,
        totalStockKg,
        totalOrders,
        totalRevenue,
      },
      statusBreakdown,
      recentOrders,
      recentUsers,
    });
  } catch (error) {
    return next(error);
  }
});

// 2. Orders Management
router.get('/orders', async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search && search.trim()) {
      filter.$or = [
        { orderNumber: { $regex: search.trim(), $options: 'i' } },
        { deliveryAddress: { $regex: search.trim(), $options: 'i' } },
        { userEmail: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate('buyerId', 'name email phone location');

    return res.status(200).json(orders);
  } catch (error) {
    return next(error);
  }
});

// Update Order Status
router.patch('/orders/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Confirmed', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed: ${allowedStatuses.join(', ')}` });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('buyerId', 'name email phone location');

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    return res.status(200).json({ message: 'Order status updated.', order });
  } catch (error) {
    return next(error);
  }
});

// 3. User Directory & Management
router.get('/users', async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const filter = {};

    if (role && role !== 'All') {
      filter.role = role;
    }

    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { phone: { $regex: search.trim(), $options: 'i' } },
        { location: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .select('-passwordHash');

    return res.status(200).json(users);
  } catch (error) {
    return next(error);
  }
});

// Delete User
router.delete('/users/:id', async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Also remove any produce owned by this farmer if they were a farmer
    if (user.role === 'Farmer') {
      await Produce.deleteMany({ farmerId: user._id });
    }

    return res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    return next(error);
  }
});

// 4. Produce Listings Management
router.get('/produce', async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search && search.trim()) {
      filter.$or = [
        { cropName: { $regex: search.trim(), $options: 'i' } },
        { location: { $regex: search.trim(), $options: 'i' } },
        { farmer: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const produce = await Produce.find(filter)
      .sort({ createdAt: -1 })
      .populate('farmerId', 'name email phone');

    return res.status(200).json(produce);
  } catch (error) {
    return next(error);
  }
});

// Delete Produce
router.delete('/produce/:id', async (req, res, next) => {
  try {
    const item = await Produce.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Produce item not found.' });
    }

    return res.status(200).json({ message: 'Produce item removed successfully.' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
