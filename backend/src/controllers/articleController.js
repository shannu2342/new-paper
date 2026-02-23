const Article = require('../models/Article');
const jwt = require('jsonwebtoken');
const { toDateKey } = require('../utils/dateKey');
const { isValidPartition, isValidDistrict } = require('../utils/apData');
const mongoose = require('mongoose');

const toKey = (value) =>
  (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

const hasValidAuthToken = (req) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return false;
    jwt.verify(token, process.env.JWT_SECRET);
    return true;
  } catch (error) {
    return false;
  }
};

const sanitizeHtml = (value) =>
  (value || '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '');

const sanitizeBilingualContent = (value = {}) => ({
  en: sanitizeHtml(value.en),
  te: sanitizeHtml(value.te)
});

const normalizeStatus = (payloadStatus) => {
  const allowed = ['draft', 'pending_review', 'published', 'rejected'];
  if (allowed.includes(payloadStatus)) return payloadStatus;
  return 'published';
};

const applyVisibilityQuery = (query, req) => {
  const isAuthed = hasValidAuthToken(req);
  if (isAuthed && req.query.includeDraft === 'true') {
    return;
  }
  const now = new Date();
  query.$and = [
    {
      $or: [
        { status: 'published' },
        { status: { $exists: false } }
      ]
    },
    {
      $or: [
        { scheduledAt: { $exists: false } },
        { scheduledAt: null },
        { scheduledAt: { $lte: now } }
      ]
    }
  ];
};

const listArticles = async (req, res) => {
  const { date, categoryType, apRegion, district, category, otherCategoryKey, isBreaking, isFeatured, limit, status, q } = req.query;
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
  if (status && ['draft', 'pending_review', 'published', 'rejected'].includes(status)) {
    query.status = status;
  } else {
    applyVisibilityQuery(query, req);
  }
  if (q) {
    const regex = new RegExp(String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [
      ...(query.$or || []),
      { 'title.en': regex },
      { 'title.te': regex },
      { 'summary.en': regex },
      { 'summary.te': regex }
    ];
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
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid article id' });
  }
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
  payload.status = normalizeStatus(payload.status);
  payload.scheduledAt = payload.scheduledAt ? new Date(payload.scheduledAt) : undefined;
  payload.content = sanitizeBilingualContent(payload.content);
  payload.summary = sanitizeBilingualContent(payload.summary || {});
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
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid article id' });
  }
  const payload = { ...req.body };
  if (payload.publishedAt || payload.dateKey) {
    payload.dateKey = toDateKey(payload.publishedAt || payload.dateKey);
  }
  if (payload.status) {
    payload.status = normalizeStatus(payload.status);
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'scheduledAt')) {
    payload.scheduledAt = payload.scheduledAt ? new Date(payload.scheduledAt) : null;
  }
  if (payload.content) {
    payload.content = sanitizeBilingualContent(payload.content);
  }
  if (payload.summary) {
    payload.summary = sanitizeBilingualContent(payload.summary);
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
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid article id' });
  }
  const article = await Article.findByIdAndDelete(id);
  if (!article) {
    return res.status(404).json({ message: 'Article not found' });
  }
  return res.json({ message: 'Deleted' });
};

const reviewArticle = async (req, res) => {
  const { id } = req.params;
  const { action, reason } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid article id' });
  }
  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'Invalid review action' });
  }
  const update = {
    reviewedBy: req.user.id,
    reviewedAt: new Date()
  };
  if (action === 'approve') {
    update.status = 'published';
    update.rejectionReason = '';
  } else {
    update.status = 'rejected';
    update.rejectionReason = (reason || '').trim();
  }
  const article = await Article.findByIdAndUpdate(id, update, { new: true });
  if (!article) {
    return res.status(404).json({ message: 'Article not found' });
  }
  return res.json(article);
};

module.exports = {
  listArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  reviewArticle
};
