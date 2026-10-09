const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true, maxlength: 254 },
  phone: { type: String, required: true, trim: true, maxlength: 32 },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, required: true, enum: ['Farmer', 'Buyer'] },
  language: { type: String, required: true, enum: ['en', 'si', 'ta'] },
  location: { type: String, required: true, trim: true, maxlength: 200 },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);