const Produce = require('../models/Produce');
const mongoose = require('mongoose');

const editableFields = [
  'cropName',
  'category',
  'quantityKg',
  'sellingPricePerKg',
  'marketPricePerKg',
  'harvestDate',
  'freshness',
  'location',
  'photoUrl',
  'description',
  'isSoldOut',
];

const getValidationMessage = (error) => {
  if (error.name === 'ValidationError') {
    return Object.values(error.errors).map((item) => item.message).join(', ');
  }
  return error.message;
};

exports.createProduce = async (req, res) => {
  try {
    const newProduce = new Produce(req.body);
    const saved = await newProduce.save();
    res.status(201).json(saved);
  } catch (error) {
    const status = error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500;
    res.status(status).json({ message: getValidationMessage(error) });
  }
};

exports.getAllProduce = async (req, res) => {
  try {
    const filter = { isSoldOut: { $ne: true } };

    if (req.query.category && req.query.category !== 'All Produce') {
      filter.category = req.query.category;
    }

    if (req.query.search) {
      const searchRegex = { $regex: req.query.search.trim(), $options: 'i' };
      filter.$or = [
        { cropName: searchRegex },
        { location: searchRegex },
        { farmer: searchRegex },
        { category: searchRegex }
      ];
    }

    const list = await Produce.find(filter).sort({ createdAt: -1 });
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch produce.' });
  }
};

exports.seedProduce = async (req, res) => {
  try {
    const SAMPLE_PRODUCE = [
      {
        cropName: 'Fresh Nuwara Eliya Carrots',
        category: 'Vegetables',
        quantityKg: 150,
        sellingPricePerKg: 280,
        marketPricePerKg: 290,
        harvestDate: 'Yesterday Morning',
        location: 'Nuwara Eliya',
        farmer: "Sunil's Farm",
        farmerPhone: '+94 77 234 5678',
        rating: 4.8,
        distanceKm: 5.0,
        minOrderQty: 5,
        photoUrl: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=600',
        description: 'Fresh crisp carrots directly from Nuwara Eliya highland farm.',
        isSoldOut: false
      },
      {
        cropName: 'Organic Leeks',
        category: 'Organic',
        quantityKg: 80,
        sellingPricePerKg: 340,
        marketPricePerKg: 360,
        harvestDate: 'Today Morning',
        location: 'Kandy',
        farmer: 'Hill Country Organic',
        farmerPhone: '+94 71 890 1234',
        rating: 4.9,
        distanceKm: 4.2,
        minOrderQty: 3,
        photoUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600',
        description: '100% certified pesticide-free organic leeks from hillside farm.',
        isSoldOut: false
      },
      {
        cropName: 'Highland Potatoes',
        category: 'Vegetables',
        quantityKg: 300,
        sellingPricePerKg: 210,
        marketPricePerKg: 230,
        harvestDate: '2 days ago',
        location: 'Nuwara Eliya',
        farmer: 'Saman Farm Greens',
        farmerPhone: '+94 77 987 6543',
        rating: 4.7,
        distanceKm: 6.5,
        minOrderQty: 10,
        photoUrl: 'https://images.unsplash.com/photo-1518977676405-d12e10cce364?w=600',
        description: 'Grade A premium highland red skin potatoes.',
        isSoldOut: false
      },
      {
        cropName: 'Red Nadu Rice',
        category: 'Bulk',
        quantityKg: 1000,
        sellingPricePerKg: 240,
        marketPricePerKg: 260,
        harvestDate: 'Last Week',
        location: 'Kurunegala',
        farmer: 'Kumara Bandara',
        farmerPhone: '+94 76 543 2109',
        rating: 4.7,
        distanceKm: 8.3,
        minOrderQty: 25,
        photoUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600',
        description: 'Traditional unpolished nutritious Red Nadu paddy rice.',
        isSoldOut: false
      },
      {
        cropName: 'Sweet Papaya',
        category: 'Fruits',
        quantityKg: 95,
        sellingPricePerKg: 190,
        marketPricePerKg: 210,
        harvestDate: 'Yesterday',
        location: 'Negombo',
        farmer: 'Saman Jayawardena',
        farmerPhone: '+94 72 345 6789',
        rating: 4.8,
        distanceKm: 7.1,
        minOrderQty: 5,
        photoUrl: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=600',
        description: 'Tree-ripened sweet Red Lady papaya, juicy and rich.',
        isSoldOut: false
      },
      {
        cropName: 'Organic Vine Tomatoes',
        category: 'Organic',
        quantityKg: 120,
        sellingPricePerKg: 290,
        marketPricePerKg: 310,
        harvestDate: 'This Morning',
        location: 'Kandy',
        farmer: 'Nimali Silva',
        farmerPhone: '+94 77 456 7890',
        rating: 4.9,
        distanceKm: 3.8,
        minOrderQty: 2,
        photoUrl: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=600',
        description: 'Naturally grown farm fresh tomatoes, picked ripe.',
        isSoldOut: false
      },
      {
        cropName: 'Cavendish Bananas',
        category: 'Fruits',
        quantityKg: 180,
        sellingPricePerKg: 160,
        marketPricePerKg: 180,
        harvestDate: 'Yesterday',
        location: 'Gampaha',
        farmer: 'Anura Fernando',
        farmerPhone: '+94 77 654 3210',
        rating: 4.6,
        distanceKm: 5.5,
        minOrderQty: 5,
        photoUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600',
        description: 'Sweet yellow Cavendish bananas fresh from the orchard.',
        isSoldOut: false
      }
    ];

    const existingNames = await Produce.distinct('cropName');
    const toInsert = SAMPLE_PRODUCE.filter(p => !existingNames.includes(p.cropName));

    if (toInsert.length > 0) {
      await Produce.insertMany(toInsert);
    }
    const fullList = await Produce.find().sort({ createdAt: -1 });
    return res.status(200).json({ message: `Seeded ${toInsert.length} new items.`, list: fullList });
  } catch (error) {
    res.status(500).json({ message: 'Error seeding produce', error: error.message });
  }
};

exports.getProduceById = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid produce ID.' });
  }

  try {
    const item = await Produce.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Produce not found.' });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch produce.' });
  }
};

exports.updateProduce = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid produce ID.' });
  }

  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([field]) => editableFields.includes(field))
  );
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'No editable produce fields provided.' });
  }

  try {
    const updated = await Produce.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Produce not found.' });
    res.status(200).json(updated);
  } catch (error) {
    const status = error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500;
    res.status(status).json({ message: getValidationMessage(error) });
  }
};

exports.deleteProduce = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid produce ID.' });
  }

  try {
    const deleted = await Produce.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Produce not found.' });
    res.status(200).json({ message: 'Produce deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to delete produce.' });
  }
};