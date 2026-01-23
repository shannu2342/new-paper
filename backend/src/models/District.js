const mongoose = require('mongoose');
const { bilingualTextSchema } = require('./bilingualText');

const districtSchema = new mongoose.Schema(
  {
    title: { type: bilingualTextSchema, required: true },
    apRegion: { type: mongoose.Schema.Types.ObjectId, ref: 'ApRegion', required: true },
    order: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('District', districtSchema);
