const Article = require('../models/Article');
const { toDateKey } = require('../utils/dateKey');
const { isValidPartition, isValidDistrict } = require('../utils/apData');

const toKey = (value) =>
  (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

const listArticles = async (req, res) => {
  const { date, categoryType, apRegion, district, category, otherCategoryKey, isBreaking, isFeatured, limit } = req.query;
  const { partition, districtCode } = req.query;
  const query = {};
  if (date) {
    query.dateKey = toDateKey(date);
  }
  if (categoryType) {
    query.categoryType = categoryType;
  }
  if (partition) {
    query.partitionCode = partition;
  }
  if (districtCode) {
    query.districtCode = districtCode;
  }
  if (apRegion) {
    query.apRegion = apRegion;
  }
  if (district) {
    query.district = district;
  }
  if (category) {
    query.category = category;
  }
  if (otherCategoryKey) {
    query.otherCategoryKey = otherCategoryKey;
  }
  if (isBreaking === 'true') {
    query.isBreaking = true;
  }
  if (isFeatured === 'true') {
    query.isFeatured = true;
  }
  const articles = await Article.find(query)
    .populate('category')
    .populate('apRegion')
    .populate('district')
    .sort({ priority: -1, publishedAt: -1 })
    .limit(limit ? Number(limit) : 0);
  return res.json(articles);
};

const getArticle = async (req, res) => {
  const { id } = req.params;
  const article = await Article.findById(id)
    .populate('category')
    .populate('apRegion')
    .populate('district');
  if (!article) {
    return res.status(404).json({ message: 'Article not found' });
  }
  return res.json(article);
};

const createArticle = async (req, res) => {
  const payload = { ...req.body };
  payload.dateKey = toDateKey(payload.publishedAt || payload.dateKey);
  payload.publishedAt = payload.publishedAt ? new Date(payload.publishedAt) : new Date();
  if (payload.categoryType === 'ap') {
    if (!payload.partitionCode || !payload.districtCode) {
      return res.status(400).json({ message: 'AP articles require partition and district.' });
    }
    if (!isValidPartition(payload.partitionCode) || !isValidDistrict(payload.partitionCode, payload.districtCode)) {
      return res.status(400).json({ message: 'Invalid AP partition or district.' });
    }
  }
  if (payload.categoryType === 'other') {
    if (!payload.otherCategory && !payload.category) {
      return res.status(400).json({ message: 'Other articles require a category name.' });
    }
    if (!payload.otherCategoryKey && payload.otherCategory?.en) {
      payload.otherCategoryKey = toKey(payload.otherCategory.en);
    }
  }
  const article = await Article.create(payload);
  return res.status(201).json(article);
};

const updateArticle = async (req, res) => {
  const { id } = req.params;
  const payload = { ...req.body };
  if (payload.publishedAt || payload.dateKey) {
    payload.dateKey = toDateKey(payload.publishedAt || payload.dateKey);
  }
  if (payload.categoryType === 'ap') {
    if (!payload.partitionCode || !payload.districtCode) {
      return res.status(400).json({ message: 'AP articles require partition and district.' });
    }
    if (!isValidPartition(payload.partitionCode) || !isValidDistrict(payload.partitionCode, payload.districtCode)) {
      return res.status(400).json({ message: 'Invalid AP partition or district.' });
    }
  }
  if (payload.categoryType === 'other') {
    if (!payload.otherCategory && !payload.category) {
      return res.status(400).json({ message: 'Other articles require a category name.' });
    }
    if (!payload.otherCategoryKey && payload.otherCategory?.en) {
      payload.otherCategoryKey = toKey(payload.otherCategory.en);
    }
  }
  const article = await Article.findByIdAndUpdate(id, payload, { new: true });
  if (!article) {
    return res.status(404).json({ message: 'Article not found' });
  }
  return res.json(article);
};

const deleteArticle = async (req, res) => {
  const { id } = req.params;
  const article = await Article.findByIdAndDelete(id);
  if (!article) {
    return res.status(404).json({ message: 'Article not found' });
  }
  return res.json({ message: 'Deleted' });
};

module.exports = {
  listArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle
};
