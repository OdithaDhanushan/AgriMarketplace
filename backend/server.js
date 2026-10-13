const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const connectDB = require('./config/db');
const User = require('./models/User');

const app = express();

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

app.get('/', (req, res) => {
  res.status(200).json({ message: 'AgriMarketplace Backend Running Successfully!' });
});

app.get('/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'unavailable',
    database: connected ? 'connected' : 'disconnected',
  });
});

const produceRoutes = require('./routes/produceRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/produce', produceRoutes);
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/users', userRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body must contain valid JSON.' });
  }

  if (error.status === 413) {
    return res.status(413).json({ message: 'Request body is too large.' });
  }

  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ message: error.message });
  }

  if (error.code === 11000) {
    return res.status(409).json({ message: 'A record with this value already exists.' });
  }

  console.error('Request error:', error);
  return res.status(500).json({ message: 'Internal server error.' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be set to a random value at least 32 characters long in backend/.env.');
  }
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required in production. Set a random value at least 32 characters long in the environment.');
  }
  if (!process.env.JWT_SECRET) {
    console.warn('JWT_SECRET is not set; using a temporary development key. Sessions expire when the backend restarts.');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required. Set it in backend/.env.');
  }

  await connectDB();
  await User.init();
  console.log('MongoDB connected.');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer().catch((error) => {
  console.error('Unable to start backend:', error.message);
  process.exit(1);
});
