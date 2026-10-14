const Produce = require('../models/Produce');
const User = require('../models/User');
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
  'farmer',
  'farmerPhone',
  'rating',
  'distanceKm',
  'minOrderQty',
  'isSoldOut',
];

const getValidationMessage = (error) => {
  if (error.name === 'ValidationError') {
    return Object.values(error.errors).map((item) => item.message).join(', ');
  }
  return error.message;
};

const CROP_FALLBACKS = {
  apple: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600',
  orange: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=600',
  mango: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600',
  amba: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600',
  banana: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600',
  kesel: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600',
  tomato: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600',
  thakkali: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600',
  carrot: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600',
  potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600',
  ala: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600',
  cabbage: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=600',
  gowa: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=600',
  pumpkin: 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=600',
  wattakka: 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=600',
  leek: 'https://images.unsplash.com/photo-1592394533824-9440e5d68530?w=600',
  bean: 'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=600',
  bonchi: 'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=600',
  onion: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600',
  lunu: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600',
  papaya: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=600',
  papol: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=600',
  watermelon: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600',
  cucumber: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=600',
};

const sanitizeCropPhoto = (cropName, photoUrl) => {
  if (typeof photoUrl === 'string' && photoUrl.startsWith('data:image/')) return photoUrl;
  if (
    typeof photoUrl === 'string' &&
    (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) &&
    !photoUrl.includes('blob:')
  ) {
    return photoUrl;
  }
  const name = String(cropName || '').toLowerCase().trim();
  for (const [key, url] of Object.entries(CROP_FALLBACKS)) {
    if (name.includes(key)) return url;
  }
  return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600';
};

exports.createProduce = async (req, res) => {
  try {
    const photoUrl = sanitizeCropPhoto(req.body.cropName, req.body.photoUrl);
    const newProduce = new Produce({ ...req.body, photoUrl, farmerId: req.user._id });
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
    const sanitizedList = list.map((item) => {
      const doc = item.toObject();
      doc.photoUrl = sanitizeCropPhoto(doc.cropName, doc.photoUrl);
      return doc;
    });
    res.status(200).json(sanitizedList);
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

exports.getMyProduce = async (req, res) => {
  try {
    const list = await Produce.find({ farmerId: req.user._id }).sort({ createdAt: -1 });
    const sanitizedList = list.map((item) => {
      const doc = item.toObject();
      doc.photoUrl = sanitizeCropPhoto(doc.cropName, doc.photoUrl);
      return doc;
    });
    return res.status(200).json(sanitizedList);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch your produce.' });
  }
};

exports.getProduceById = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid produce ID.' });
  }

  try {
    const item = await Produce.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Produce not found.' });
    const doc = item.toObject();
    doc.photoUrl = sanitizeCropPhoto(doc.cropName, doc.photoUrl);
    res.status(200).json(doc);
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
    const existing = await Produce.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Produce not found.' });
    }

    // STRICT OWNER CHECK: Only the farmer who added this produce can update it
    const isOwner = existing.farmerId && existing.farmerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You can only edit products you added yourself.' });
    }

    const updated = await Produce.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
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
    const existing = await Produce.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Produce not found.' });
    }

    // STRICT OWNER CHECK: Only the farmer who added this produce can delete it
    const isOwner = existing.farmerId && existing.farmerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You can only delete products you added yourself.' });
    }

    await Produce.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Produce deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to delete produce.' });
  }
};

exports.addProduceReview = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid produce ID.' });
  }

  const { userName, rating, comment } = req.body || {};

  if (!userName || typeof userName !== 'string' || !userName.trim()) {
    return res.status(400).json({ message: 'User name is required.' });
  }

  const numericRating = Number(rating);
  if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ message: 'Rating must be a number between 1 and 5.' });
  }

  if (!comment || typeof comment !== 'string' || !comment.trim()) {
    return res.status(400).json({ message: 'Review comment is required.' });
  }

  try {
    const produce = await Produce.findById(req.params.id);
    if (!produce) {
      return res.status(404).json({ message: 'Produce not found.' });
    }

    const newReview = {
      userName: userName.trim(),
      rating: Math.round(numericRating),
      comment: comment.trim(),
      createdAt: new Date()
    };

    if (!Array.isArray(produce.reviews)) {
      produce.reviews = [];
    }

    produce.reviews.unshift(newReview);

    const total = produce.reviews.reduce((sum, item) => sum + item.rating, 0);
    produce.rating = Math.round((total / produce.reviews.length) * 10) / 10;

    await produce.save();

    return res.status(201).json({
      message: 'Review submitted successfully.',
      produce
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to submit review.' });
  }
};