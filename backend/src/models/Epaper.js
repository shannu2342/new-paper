const mongoose = require('mongoose');

const epaperSchema = new mongoose.Schema(
  {
    dateKey: { type: String, required: true, index: true },
    publishedAt: { type: Date, required: true },
    teluguPdfUrl: { type: String, required: true },
    englishPdfUrl: { type: String },
    enabled: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Epaper', epaperSchema);
