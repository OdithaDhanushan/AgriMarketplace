const crypto = require('node:crypto');
const { promisify } = require('node:util');
const User = require('../models/User');

const scrypt = promisify(crypto.scrypt);

const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const key = await scrypt(password, salt, 64);
  return `${salt}:${key.toString('hex')}`;
};

async function seedAdminUser() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@agri.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

    let existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });

    if (!existingAdmin) {
      const passwordHash = await hashPassword(adminPassword);
      existingAdmin = await User.create({
        name: 'System Administrator',
        email: adminEmail.toLowerCase(),
        phone: '+94770000000',
        passwordHash,
        role: 'Admin',
        language: 'en',
        location: 'Colombo, Sri Lanka',
        farmName: 'AgriMarketplace HQ',
        paymentMode: 'Direct Bank Transfer',
      });
      console.log(`[SEED] Default Admin created successfully: ${existingAdmin.email} / ${adminPassword}`);
      return existingAdmin;
    }

    if (existingAdmin.role !== 'Admin') {
      existingAdmin.role = 'Admin';
      await existingAdmin.save();
    }

    console.log(`[SEED] Admin account ready: ${existingAdmin.email} (${existingAdmin.role})`);
    return existingAdmin;
  } catch (error) {
    console.error('[SEED] Failed to seed admin user:', error.message);
  }
}

module.exports = seedAdminUser;
