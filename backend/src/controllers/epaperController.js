const Epaper = require('../models/Epaper');
const { toDateKey } = require('../utils/dateKey');

const listEpapers = async (req, res) => {
  const { date } = req.query;
  const query = {};
  if (date) {
    query.dateKey = toDateKey(date);
  }
  const epapers = await Epaper.find(query).sort({ publishedAt: -1 });
  return res.json(epapers);
};

const createEpaper = async (req, res) => {
  const payload = { ...req.body };
  payload.dateKey = toDateKey(payload.publishedAt || payload.dateKey);
  payload.publishedAt = payload.publishedAt ? new Date(payload.publishedAt) : new Date();
  const epaper = await Epaper.create(payload);
  return res.status(201).json(epaper);
};

const updateEpaper = async (req, res) => {
  const { id } = req.params;
  const payload = { ...req.body };
  if (payload.publishedAt || payload.dateKey) {
    payload.dateKey = toDateKey(payload.publishedAt || payload.dateKey);
  }
  const epaper = await Epaper.findByIdAndUpdate(id, payload, { new: true });
  if (!epaper) {
    return res.status(404).json({ message: 'E-paper not found' });
  }
  return res.json(epaper);
};

const deleteEpaper = async (req, res) => {
  const { id } = req.params;
  const epaper = await Epaper.findByIdAndDelete(id);
  if (!epaper) {
    return res.status(404).json({ message: 'E-paper not found' });
  }
  return res.json({ message: 'Deleted' });
};

module.exports = { listEpapers, createEpaper, updateEpaper, deleteEpaper };
