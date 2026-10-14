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
      console.log(`[SEED] Default Admin created: ${existingAdmin.email} / ${adminPassword}`);
    } else {
      console.log(`[SEED] Admin account ready: ${existingAdmin.email} (${existingAdmin.role})`);
    }

    // Seed Demo Buyer (Sahan) if not existing
    const buyerEmail = 'sahan@gmail.com';
    let existingBuyer = await User.findOne({ email: buyerEmail.toLowerCase() });
    if (!existingBuyer) {
      const buyerHash = await hashPassword('agri12345');
      existingBuyer = await User.create({
        name: 'Sahan (Buyer)',
        email: buyerEmail.toLowerCase(),
        phone: '+94771234567',
        passwordHash: buyerHash,
        role: 'Buyer',
        language: 'en',
        location: 'Colombo 07, Sri Lanka',
        farmName: '',
        paymentMode: 'Cash on Pickup / Delivery',
      });
      console.log(`[SEED] Default Buyer created: ${existingBuyer.email} / agri12345`);
    } else {
      console.log(`[SEED] Buyer account ready: ${existingBuyer.email}`);
    }

    // Seed Demo Farmer if not existing
    const farmerEmail = 'farmer@agri.com';
    let existingFarmer = await User.findOne({ email: farmerEmail.toLowerCase() });
    if (!existingFarmer) {
      const farmerHash = await hashPassword('Farmer@12345');
      existingFarmer = await User.create({
        name: "Sunil Perera (Farmer)",
        email: farmerEmail.toLowerCase(),
        phone: '+94772345678',
        passwordHash: farmerHash,
        role: 'Farmer',
        language: 'en',
        location: 'Dambadeniya, Kurunegala',
        farmName: "Sunil's Farm",
        paymentMode: 'Direct Bank Transfer',
      });
      console.log(`[SEED] Default Farmer created: ${existingFarmer.email} / Farmer@12345`);
    } else {
      console.log(`[SEED] Farmer account ready: ${existingFarmer.email}`);
    }

    return existingAdmin;
  } catch (error) {
    console.error('[SEED] Failed to seed default users:', error.message);
  }
}

module.exports = seedAdminUser;
