const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

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

// Routes
const produceRoutes = require('./routes/produceRoutes');
app.use('/api/produce', produceRoutes);

try {
  app.use('/api/products', require('./routes/productRoutes'));
} catch (e) {}

try {
  app.use('/api/orders', require('./routes/orderRoutes'));
} catch (e) {}

try {
  const userRoutes = require('./routes/userRoutes');
  app.use('/api/users', userRoutes);
} catch (e) {}

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
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required. Set it in backend/.env.');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected successfully.');
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

startServer().catch((error) => {
  console.error('❌ Unable to start backend:', error.message);
  process.exit(1);
});