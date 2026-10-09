const { promisify } = require('node:util');
const { randomBytes, scrypt: scryptCallback } = require('node:crypto');
const User = require('../models/User');

const scrypt = promisify(scryptCallback);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const hashPassword = async (password) => {
  const salt = randomBytes(16).toString('hex');
  const key = await scrypt(password, salt, 64);
  return `${salt}:${key.toString('hex')}`;
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

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      passwordHash: await hashPassword(password),
      role,
      language,
      location: location.trim(),
    });

    res.status(201).json({
      message: 'Account created successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        language: user.language,
        location: user.location,
      },
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
    res.status(500).json({ message: 'Unable to create your account right now. Please try again.' });
  }
};