const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['Vegetables', 'Fruits', 'Rice', 'Spices', 'Organic', 'Bulk'],
    required: true
  },
  pricePerKg: { type: Number, required: true, min: 0 },
  availableStock: { type: Number, default: 0, min: 0 },
  minOrderQty: { type: Number, default: 1, min: 0 },
  location: { type: String, trim: true, default: '' },
  distanceKm: { type: Number, min: 0 },
  harvestDate: { type: String, default: '' },
  rating: { type: Number, default: 4.5, min: 0, max: 5 },
  farmer: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    isVerified: { type: Boolean, default: false }
  },
  imageUrl: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);