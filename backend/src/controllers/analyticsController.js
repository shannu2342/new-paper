const AnalyticsEvent = require('../models/AnalyticsEvent');
const { toDateKey } = require('../utils/dateKey');

const buildDateKeys = (start, days) =>
  Array.from({ length: days }).map((_, index) => {
    const next = new Date(start);
    next.setDate(start.getDate() + index);
    return toDateKey(next);
  });

const trackEvent = async (req, res) => {
  const { type, visitorId, sessionId, path, referrer, meta, date } = req.body || {};
  if (!['visit', 'pageview'].includes(type)) {
    return res.status(400).json({ message: 'Invalid event type' });
  }
  if (!visitorId || String(visitorId).trim().length < 8) {
    return res.status(400).json({ message: 'Invalid visitor id' });
  }

  await AnalyticsEvent.create({
    type,
    visitorId: String(visitorId).trim(),
    sessionId: String(sessionId || '').trim(),
    path: String(path || req.path || '/').trim() || '/',
    referrer: String(referrer || '').trim(),
    userAgent: req.get('user-agent') || '',
    dateKey: toDateKey(date || new Date()),
    meta: meta && typeof meta === 'object' ? meta : {}
  });

  return res.status(201).json({ ok: true });
};

const getSummary = async (req, res) => {
  const days = Math.min(120, Math.max(1, Number(req.query.days || 30)));
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  const startKey = toDateKey(start);
  const endKey = toDateKey(end);

  const baseMatch = { dateKey: { $gte: startKey, $lte: endKey } };
  const dateKeys = buildDateKeys(start, days);

  const [counts, uniqueVisitors, topPages, perDay, sectionViews] = await Promise.all([
    AnalyticsEvent.aggregate([
      { $match: baseMatch },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]),
    AnalyticsEvent.aggregate([
      { $match: baseMatch },
      { $group: { _id: '$visitorId' } },
      { $count: 'count' }
    ]),
    AnalyticsEvent.aggregate([
      { $match: { ...baseMatch, type: 'pageview' } },
      { $group: { _id: '$path', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 10 }
    ]),
    AnalyticsEvent.aggregate([
      { $match: baseMatch },
      { $group: { _id: { dateKey: '$dateKey', type: '$type' }, count: { $sum: 1 } } },
      { $sort: { '_id.dateKey': 1 } }
    ]),
    AnalyticsEvent.aggregate([
      { $match: { ...baseMatch, type: 'pageview' } },
      {
        $project: {
          section: {
            $switch: {
              branches: [
                { case: { $or: [{ $eq: ['$path', '/'] }, { $regexMatch: { input: '$path', regex: '^/home(?:/|$)?' } }] }, then: 'home' },
                { case: { $regexMatch: { input: '$path', regex: '^/ap(?:/|$)|^/district(?:/|$)' } }, then: 'ap' },
                { case: { $regexMatch: { input: '$path', regex: '^/other(?:/|$)' } }, then: 'other' }
              ],
              default: 'other_sections'
            }
          }
        }
      },
      { $group: { _id: '$section', views: { $sum: 1 } } },
      { $sort: { views: -1 } }
    ])
  ]);

  const perDayMap = new Map();
  perDay.forEach((row) => {
    const dateKey = row?._id?.dateKey;
    const type = row?._id?.type;
    if (!dateKey || !type) return;
    const current = perDayMap.get(dateKey) || { dateKey, visits: 0, pageviews: 0 };
    if (type === 'visit') current.visits = row.count;
    if (type === 'pageview') current.pageviews = row.count;
    perDayMap.set(dateKey, current);
  });
  const trends = dateKeys.map((dateKey) => perDayMap.get(dateKey) || { dateKey, visits: 0, pageviews: 0 });

  const sectionDefaults = { home: 0, ap: 0, other: 0, other_sections: 0 };
  sectionViews.forEach((row) => {
    if (!row?._id) return;
    sectionDefaults[row._id] = row.views || 0;
  });

  const summary = {
    range: { start: startKey, end: endKey, days },
    totalVisits: counts.find((c) => c._id === 'visit')?.count || 0,
    totalPageViews: counts.find((c) => c._id === 'pageview')?.count || 0,
    uniqueVisitors: uniqueVisitors[0]?.count || 0,
    topPages: topPages.map((entry) => ({ path: entry._id, views: entry.views })),
    perDay,
    trends,
    sectionViews: sectionDefaults
  };

  return res.json(summary);
};

module.exports = { trackEvent, getSummary };
