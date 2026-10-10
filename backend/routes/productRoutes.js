const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');

const router = express.Router();
const categories = ['Vegetables', 'Fruits', 'Rice', 'Spices', 'Organic', 'Bulk'];

const seedProducts = [
  {
    title: 'Fresh Carrots',
    category: 'Vegetables',
    pricePerKg: 280,
    availableStock: 120,
    minOrderQty: 1,
    location: 'Nuwara Eliya',
    distanceKm: 12,
    harvestDate: '2026-10-06',
    rating: 4.8,
    farmer: { name: 'Kamal Perera', phone: '+94771234567', isVerified: true },
    imageUrl: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=800'
  },
  {
    title: 'Organic Tomatoes',
    category: 'Organic',
    pricePerKg: 350,
    availableStock: 65,
    minOrderQty: 1,
    location: 'Kandy',
    distanceKm: 28,
    harvestDate: '2026-10-06',
    rating: 4.7,
    farmer: { name: 'Nimali Silva', phone: '+94772345678', isVerified: true },
    imageUrl: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=800'
  },
  {
    title: 'Red Rice',
    category: 'Rice',
    pricePerKg: 420,
    availableStock: 300,
    minOrderQty: 2,
    location: 'Kurunegala',
    distanceKm: 46,
    harvestDate: '2026-09-28',
    rating: 4.9,
    farmer: { name: 'Sunil Jayawardena', phone: '+94773456789', isVerified: true },
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800'
  },
  {
    title: 'Cavendish Bananas',
    category: 'Fruits',
    pricePerKg: 240,
    availableStock: 90,
    minOrderQty: 1,
    location: 'Gampaha',
    distanceKm: 19,
    harvestDate: '2026-10-05',
    rating: 4.6,
    farmer: { name: 'Anura Fernando', phone: '+94774567890', isVerified: false },
    imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800'
  }
];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    const searchValue = req.query.search ?? req.query.q ?? '';
    const categoryValue = req.query.category ?? '';

    if (typeof searchValue !== 'string' || typeof categoryValue !== 'string') {
      return res.status(400).json({ message: 'Search and category must be strings.' });
    }

    const search = searchValue.trim();
    const category = categoryValue.trim();

    if (search) {
      filter.title = { $regex: escapeRegex(search), $options: 'i' };
    }

    if (category) {
      if (!categories.includes(category)) {
        return res.status(400).json({ message: 'Invalid product category.' });
      }
      filter.category = category;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(products);
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid product ID.' });
  }

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    return res.status(200).json(product);
  } catch (error) {
    return next(error);
  }
});

router.post('/seed', async (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ message: 'Not found.' });
  }

  try {
    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
      return res.status(200).json({
        message: 'Products already exist; seed data was not inserted.',
        count: existingCount
      });
    }

    const products = await Product.insertMany(seedProducts);
    return res.status(201).json({ message: 'Seed products created.', products });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;