const mongoose = require('mongoose');
const { bilingualTextSchema } = require('./bilingualText');

const articleSchema = new mongoose.Schema(
  {
    title: { type: bilingualTextSchema, required: true },
    content: { type: bilingualTextSchema, required: true },
    summary: { type: bilingualTextSchema },
    dateKey: { type: String, required: true, index: true },
    publishedAt: { type: Date, required: true },
    categoryType: {
      type: String,
      enum: [
        'home',
        'amaravati',
        'ap',
        'international',
        'national',
        'sports',
        'cinema',
        'other'
      ],
      required: true
    },
    partitionCode: { type: String, index: true },
    districtCode: { type: String, index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    apRegion: { type: mongoose.Schema.Types.ObjectId, ref: 'ApRegion' },
    district: { type: mongoose.Schema.Types.ObjectId, ref: 'District' },
    images: [{ type: String }],
    isBreaking: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    priority: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Article', articleSchema);
