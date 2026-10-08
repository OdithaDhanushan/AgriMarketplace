const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('AgriMarketplace Backend Running Successfully!');
});

app.get('/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'unavailable',
    database: connected ? 'connected' : 'disconnected',
  });
});

const produceRoutes = require('./routes/produceRoutes');
app.use('/api/produce', produceRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);
const User = require('./models/User');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required. Set it in backend/.env.');
  }

  await mongoose.connect(process.env.MONGO_URI);
  await User.init();
  console.log('MongoDB connected.');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer().catch((error) => {
  console.error('Unable to start backend:', error.message);
  process.exit(1);
});