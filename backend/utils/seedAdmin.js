const crypto = require('node:crypto');
const { promisify } = require('node:util');
const User = require('../models/User');
const Order = require('../models/Order');

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

    // Seed Demo Driver (Nimal Perera) if not existing
    const driverEmail = 'driver@agri.com';
    let existingDriver = await User.findOne({ email: driverEmail.toLowerCase() });
    if (!existingDriver) {
      const driverHash = await hashPassword('Driver@12345');
      existingDriver = await User.create({
        name: 'Nimal Perera (Driver)',
        email: driverEmail.toLowerCase(),
        phone: '+94 77 123 4567',
        passwordHash: driverHash,
        role: 'Driver',
        language: 'en',
        location: 'Kurunegala, Sri Lanka',
        farmName: 'Express Agri Logistics',
        paymentMode: 'Mobile Wallet',
      });
      console.log(`[SEED] Default Driver created: ${existingDriver.email} / Driver@12345`);
    } else {
      console.log(`[SEED] Driver account ready: ${existingDriver.email}`);
    }

    // Seed Demo Delivery Orders if no active orders exist
    const orderCount = await Order.countDocuments();
    if (orderCount === 0 && existingBuyer) {
      await Order.create([
        {
          buyerId: existingBuyer._id,
          orderNumber: '#SK1024',
          items: [
            {
              productName: 'Fresh Tomatoes',
              name: 'Fresh Tomatoes',
              quantity: 10,
              unitPrice: 245,
              unit: 'kg',
              image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400',
              farmer: "Sunil's Farm, Dambadeniya",
            },
          ],
          totalAmount: 2450,
          deliveryFee: 650,
          deliveryAddress: 'Green Leaf Restaurant, Kurunegala',
          paymentMethod: 'Cash on Delivery',
          userEmail: existingBuyer.email,
          otpCode: '4827',
          status: 'Confirmed',
          driverName: 'Nimal Perera',
          driverPhone: '+94 77 123 4567',
        },
        {
          buyerId: existingBuyer._id,
          orderNumber: '#SK1025',
          items: [
            {
              productName: 'Organic Carrots',
              name: 'Organic Carrots',
              quantity: 15,
              unitPrice: 240,
              unit: 'kg',
              image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400',
              farmer: "Sunil's Farm, Dambadeniya",
            },
          ],
          totalAmount: 3600,
          deliveryFee: 750,
          deliveryAddress: 'Colombo Central Market, Pettah',
          paymentMethod: 'Cash on Delivery',
          userEmail: existingBuyer.email,
          otpCode: '8192',
          status: 'Pending',
          driverName: 'Nimal Perera',
          driverPhone: '+94 77 123 4567',
        },
      ]);
      console.log('[SEED] Demo delivery orders (#SK1024, #SK1025) created for Driver Portal.');
    }

    return existingAdmin;
  } catch (error) {
    console.error('[SEED] Failed to seed default users:', error.message);
  }
}

module.exports = seedAdminUser;
