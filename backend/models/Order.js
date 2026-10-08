const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productName: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0.01 },
  pricePerKg: { type: Number, required: true, min: 0 }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    default: () => `#SK${Date.now()}${Math.floor(Math.random() * 900 + 100)}`
  },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: (items) => items.length > 0,
      message: 'An order must contain at least one item.'
    }
  },
  totalAmount: { type: Number, required: true, min: 0 },
  deliveryFee: { type: Number, default: 0, min: 0 },
  deliveryAddress: { type: String, required: true, trim: true },
  paymentMethod: { type: String, default: 'Cash on Delivery', trim: true },
  otpCode: {
    type: String,
    default: '4827',
    match: [/^\d{4}$/, 'OTP must be exactly 4 digits.']
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Delivered'],
    default: 'Pending'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);