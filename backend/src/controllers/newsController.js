const Article = require('../models/Article');
const { toDateKey } = require('../utils/dateKey');

const listNews = async (req, res) => {
  const { section, partition, district, date, isBreaking, isFeatured, limit } = req.query;
  const query = {};

  if (section) {
    if (section.toUpperCase() === 'AP') {
      query.categoryType = 'ap';
    }
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

  const news = await Article.find(query)
    .sort({ priority: -1, publishedAt: -1 })
    .limit(limit ? Number(limit) : 0);
  return res.json(news);
};

module.exports = { listNews };
