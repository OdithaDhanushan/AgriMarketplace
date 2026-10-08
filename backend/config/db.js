const mongoose = require('mongoose');

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is not set. Add it to the backend environment.');
  }

  await mongoose.connect(mongoUri);
  console.log('MongoDB connected');
  return mongoose.connection;
}

module.exports = connectDB;