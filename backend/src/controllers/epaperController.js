const Epaper = require('../models/Epaper');
const { toDateKey } = require('../utils/dateKey');

const normalizeRegionCode = (value) => {
  const normalized = (value || 'ALL').toString().trim().toUpperCase();
  return normalized || 'ALL';
};

const listEpapers = async (req, res) => {
  const { date, region, before, limit } = req.query;
  const query = {};
  if (date) {
    query.dateKey = toDateKey(date);
  }
  if (before) {
    query.dateKey = { ...(query.dateKey || {}), $lt: toDateKey(before) };
  }
  if (region) {
    query.regionCode = normalizeRegionCode(region);
  }
  const epapers = await Epaper.find(query)
    .sort({ dateKey: -1, publishedAt: -1 })
    .limit(limit ? Number(limit) : 0);
  return res.json(epapers);
};

const createEpaper = async (req, res) => {
  const payload = { ...req.body };
  payload.dateKey = toDateKey(payload.publishedAt || payload.dateKey);
  payload.publishedAt = payload.publishedAt ? new Date(payload.publishedAt) : new Date();
  payload.regionCode = normalizeRegionCode(payload.regionCode);
  const query =
    payload.regionCode === 'ALL'
      ? { dateKey: payload.dateKey, $or: [{ regionCode: 'ALL' }, { regionCode: { $exists: false } }] }
      : { dateKey: payload.dateKey, regionCode: payload.regionCode };
  const epaper = await Epaper.findOneAndUpdate(
    query,
    payload,
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return res.status(201).json(epaper);
};

const updateEpaper = async (req, res) => {
  const { id } = req.params;
  const payload = { ...req.body };
  if (payload.publishedAt || payload.dateKey) {
    payload.dateKey = toDateKey(payload.publishedAt || payload.dateKey);
  }
  if (payload.regionCode) {
    payload.regionCode = normalizeRegionCode(payload.regionCode);
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
