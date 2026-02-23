const Article = require('../models/Article');
const { toDateKey } = require('../utils/dateKey');

const listNews = async (req, res) => {
  const { section, partition, district, date, isBreaking, isFeatured, limit, categoryType, otherCategoryKey, q } = req.query;
  const query = {};

  if (section) {
    if (section.toUpperCase() === 'AP') {
      query.categoryType = 'ap';
    }
  }
  if (categoryType) {
    query.categoryType = categoryType;
  }
  if (otherCategoryKey) {
    query.otherCategoryKey = otherCategoryKey;
  }
  if (partition) {
    query.partitionCode = partition;
  }
  if (district) {
    query.districtCode = district;
  }
  if (date) {
    query.dateKey = toDateKey(date);
  }
  if (isBreaking === 'true') {
    query.isBreaking = true;
  }
  if (isFeatured === 'true') {
    query.isFeatured = true;
  }
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
        { scheduledAt: { $lte: new Date() } }
      ]
    }
  ];
  if (q) {
    const regex = new RegExp(String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [
      { 'title.en': regex },
      { 'title.te': regex },
      { 'summary.en': regex },
      { 'summary.te': regex }
    ];
  }

  const news = await Article.find(query)
    .sort({ priority: -1, publishedAt: -1 })
    .limit(limit ? Number(limit) : 0);
  return res.json(news);
};

module.exports = { listNews };
