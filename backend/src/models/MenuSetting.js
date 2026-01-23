const mongoose = require('mongoose');
const { bilingualTextSchema } = require('./bilingualText');

const headerItemSchema = new mongoose.Schema(
  {
    key: {
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
    title: { type: bilingualTextSchema, required: true },
    order: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true }
  },
  { _id: false }
);

const menuSettingSchema = new mongoose.Schema(
  {
    headerItems: { type: [headerItemSchema], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model('MenuSetting', menuSettingSchema);
