const mongoose = require('mongoose');
const { bilingualTextSchema } = require('./bilingualText');

const categorySchema = new mongoose.Schema(
  {
    title: { type: bilingualTextSchema, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    type: {
      type: String,
      enum: ['other', 'general'],
      default: 'other'
    },
    order: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
