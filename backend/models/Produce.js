const mongoose = require('mongoose');

const produceSchema = new mongoose.Schema({
  cropName: { type: String, required: true, trim: true },
  category: { type: String, default: 'Vegetables' },
  quantityKg: { type: Number, required: true, min: 0.01 },
  sellingPricePerKg: { type: Number, required: true, min: 0.01 },
  marketPricePerKg: { type: Number, default: 180, min: 0 },
  harvestDate: { type: String, default: '17 September 2026' },
  freshness: { type: String, enum: ['Today', 'Yesterday'] },
  location: { type: String, default: 'Kurunegala' },
  photoUrl: { type: String, default: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400' },
  description: { type: String, default: 'Fresh and organic produce' },
  farmer: { type: String, default: 'Local Farm' },
  farmerPhone: { type: String, default: '+94 77 123 4567' },
  rating: { type: Number, default: 4.8 },
  distanceKm: { type: Number, default: 5.0 },
  minOrderQty: { type: Number, default: 1 },
  isSoldOut: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Produce', produceSchema);