const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productName: { type: String, default: 'Fresh Produce', trim: true },
  name: { type: String, trim: true },
  quantity: { type: Number, required: true, min: 0.01 },
  pricePerKg: { type: Number, default: 0, min: 0 },
  unitPrice: { type: Number, default: 0, min: 0 },
  unit: { type: String, default: 'kg' },
  image: { type: String, default: '' },
  farmer: { type: String, default: '' }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
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
  userEmail: { type: String, trim: true, lowercase: true, default: '' },
  otpCode: {
    type: String,
    required: true,
    match: [/^\d{4}$/, 'OTP must be exactly 4 digits.']
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Picked up', 'Out for delivery', 'Delivered'],
    default: 'Pending'
  },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  driverName: { type: String, default: 'Nimal Perera' },
  driverPhone: { type: String, default: '+94 77 123 4567' },
  pickupPhoto: { type: String, default: '' },
  deliveredAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);