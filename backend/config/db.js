const dns = require('dns');
const path = require('path');
const mongoose = require('mongoose');

// Configure reliable DNS servers (Google + Cloudflare) to ensure MongoDB SRV lookups succeed across all networks
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is not set. Add it to backend/.env');
  }

  await mongoose.connect(mongoUri);
  console.log(`🍃 MongoDB (Mongoose) connected successfully! [DB: ${mongoose.connection.name}]`);
  return mongoose.connection;
}

module.exports = connectDB;