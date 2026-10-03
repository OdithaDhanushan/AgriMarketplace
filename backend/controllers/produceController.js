const Produce = require('../models/Produce');

exports.createProduce = async (req, res) => {
  try {
    const newProduce = new Produce(req.body);
    const saved = await newProduce.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Error adding produce', error: error.message });
  }
};

exports.getAllProduce = async (req, res) => {
  try {
    const list = await Produce.find().sort({ createdAt: -1 });
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching produce', error: error.message });
  }
};

exports.getProduceById = async (req, res) => {
  try {
    const item = await Produce.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching item', error: error.message });
  }
};

exports.updateProduce = async (req, res) => {
  try {
    const updated = await Produce.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating', error: error.message });
  }
};

exports.deleteProduce = async (req, res) => {
  try {
    await Produce.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting', error: error.message });
  }
};