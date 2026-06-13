const mongoose = require('mongoose');

const regionCodes = ['ALL', 'NORTH_ANDHRA', 'NORTH_COASTAL_ANDHRA', 'CENTRAL_COASTAL_ANDHRA', 'SOUTH_COASTAL_ANDHRA', 'SEEMA_ANDHRA'];

const epaperSchema = new mongoose.Schema(
  {
    dateKey: { type: String, required: true, index: true },
    publishedAt: { type: Date, required: true },
    regionCode: { type: String, enum: regionCodes, default: 'ALL', index: true },
    teluguPdfUrl: { type: String, required: true },
    englishPdfUrl: { type: String },
    enabled: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Epaper', epaperSchema);
