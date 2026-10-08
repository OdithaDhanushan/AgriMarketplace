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
    const list = await Produce.find().sort({ createdAt: -1 });
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch produce.' });
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