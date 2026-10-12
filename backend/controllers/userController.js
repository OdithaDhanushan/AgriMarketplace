const crypto = require('node:crypto');
const { promisify } = require('node:util');
const { randomBytes, scrypt: scryptCallback } = require('node:crypto');
const User = require('../models/User');
const Produce = require('../models/Produce');
const { signToken } = require('../middleware/auth');

const scrypt = promisify(scryptCallback);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  language: user.language,
  location: user.location,
  farmName: user.farmName || '',
  paymentMode: user.paymentMode || '',
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const hashPassword = async (password) => {
  const salt = randomBytes(16).toString('hex');
  const key = await scrypt(password, salt, 64);
  return `${salt}:${key.toString('hex')}`;
};

const verifyPassword = async (password, passwordHash) => {
  if (!passwordHash) return false;

  const [salt, hash] = passwordHash.split(':');
  if (!salt || !hash) return false;

  const key = await scrypt(password, salt, 64);
  const expectedHash = key.toString('hex');
  return crypto.timingSafeEqual(Buffer.from(expectedHash, 'hex'), Buffer.from(hash, 'hex'));
};

exports.register = async (req, res) => {
  const { name, email, phone, password, role, language, location } = req.body;
  const requiredValues = [name, email, phone, password, role, language, location];

  if (requiredValues.some((value) => typeof value !== 'string' || !value.trim())) {
    return res.status(400).json({ message: 'Please complete all required fields.' });
  }
  if (!emailPattern.test(email.trim())) {
    return res.status(400).json({ message: 'Enter a valid email address.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }
  if (!['Farmer', 'Buyer'].includes(role)) {
    return res.status(400).json({ message: 'Choose Farmer or Buyer as your role.' });
  }
  if (!['en', 'si', 'ta'].includes(language)) {
    return res.status(400).json({ message: 'Choose a supported language.' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.exists({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        code: 'EMAIL_EXISTS',
        message: 'An account with this email already exists.',
      });
    }
    const existingPhone = await User.exists({ phone: phone.trim() });
    if (existingPhone) {
      return res.status(409).json({
        code: 'PHONE_EXISTS',
        message: 'An account with this phone number already exists.',
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      passwordHash: await hashPassword(password),
      role,
      language,
      location: location.trim(),
    });

    const token = signToken({ userId: user._id.toString() });

    return res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: safeUser(user),
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(409).json({
        code: 'EMAIL_EXISTS',
        message: 'An account with this email already exists.',
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Please check the registration details and try again.' });
    }
    console.error('User registration failed:', error.message);
    return res.status(500).json({ message: 'Unable to create your account right now. Please try again.' });
  }
};

exports.login = async (req, res) => {
  const { identifier, password } = req.body;

  if (typeof identifier !== 'string' || !identifier.trim()) {
    return res.status(400).json({ message: 'Please enter your email or phone number.' });
  }

  if (typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ message: 'Please enter your password.' });
  }

  try {
    const normalizedIdentifier = identifier.trim();
    const isEmail = emailPattern.test(normalizedIdentifier);
    const baseQuery = isEmail
      ? { email: normalizedIdentifier.toLowerCase() }
      : { phone: normalizedIdentifier };

    let user;
    if (isEmail) {
      user = await User.findOne(baseQuery).select('+passwordHash');
    } else {
      const phoneMatches = await User.find(baseQuery).select('_id').limit(2);
      if (phoneMatches.length > 1) {
        return res.status(409).json({
          message: 'Multiple accounts use this phone number. Sign in with your email address.',
        });
      }
      user = phoneMatches.length === 1
        ? await User.findById(phoneMatches[0]._id).select('+passwordHash')
        : null;
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid email/phone or password.' });
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email/phone or password.' });
    }

    const token = signToken({ userId: user._id.toString() });

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: safeUser(user),
    });
  } catch (error) {
    console.error('User login failed:', error.message);
    return res.status(500).json({ message: 'Unable to log in right now. Please try again.' });
  }
};

exports.getProfile = async (req, res) => {
  return res.status(200).json({
    message: 'Profile loaded successfully.',
    user: safeUser(req.user),
  });
};

exports.updateProfile = async (req, res) => {
  const { name, email, phone, location, farmName, paymentMode } = req.body;
  const updates = {};

  if (typeof name === 'string' && name.trim()) updates.name = name.trim();
  if (typeof phone === 'string' && phone.trim()) {
    const duplicatePhone = await User.findOne({ phone: phone.trim(), _id: { $ne: req.user._id } });
    if (duplicatePhone) {
      return res.status(409).json({ message: 'An account with this phone number already exists.' });
    }
    updates.phone = phone.trim();
  }
  if (typeof location === 'string' && location.trim()) updates.location = location.trim();
  if (typeof farmName === 'string') updates.farmName = farmName.trim();

  const paymentModes = ['', 'Direct Bank Transfer', 'Cash on Pickup / Delivery', 'Mobile Wallet'];
  if (typeof paymentMode === 'string') {
    if (!paymentModes.includes(paymentMode)) {
      return res.status(400).json({ message: 'Choose a supported payment mode.' });
    }
    updates.paymentMode = paymentMode;
  }

  if (typeof email === 'string' && email.trim()) {
    const normalizedEmail = email.trim().toLowerCase();
    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Enter a valid email address.' });
    }

    const duplicateUser = await User.findOne({ email: normalizedEmail, _id: { $ne: req.user._id } });
    if (duplicateUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    updates.email = normalizedEmail;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'No valid profile changes were provided.' });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true }).select('-passwordHash');
    if (!updatedUser) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    return res.status(200).json({
      message: 'Profile updated successfully.',
      user: safeUser(updatedUser),
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    console.error('Profile update failed:', error.message);
    return res.status(500).json({ message: 'Unable to update your profile right now.' });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    await Produce.deleteMany({ farmerId: req.user._id });
    const deletedUser = await User.findByIdAndDelete(req.user._id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    return res.status(200).json({
      message: 'Account deleted successfully.',
    });
  } catch (error) {
    console.error('Account deletion failed:', error.message);
    return res.status(500).json({ message: 'Unable to delete the account right now.' });
  }
};