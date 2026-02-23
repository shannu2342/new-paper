const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['visit', 'pageview'], required: true, index: true },
    visitorId: { type: String, required: true, index: true },
    sessionId: { type: String, trim: true, default: '' },
    path: { type: String, default: '/', index: true },
    referrer: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    dateKey: { type: String, index: true, required: true },
    meta: { type: Object, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
