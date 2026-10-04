const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully!'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Test Route
app.get('/', (req, res) => {
  res.send('AgriMarketplace Backend Running Successfully!');
});

// Import Farmer Routes (Member 1)
const produceRoutes = require('./routes/produceRoutes');
app.use('/api/produce', produceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});