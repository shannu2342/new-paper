const mongoose = require('mongoose');
const { bilingualTextSchema } = require('./bilingualText');

const apRegionSchema = new mongoose.Schema(
  {
    title: { type: bilingualTextSchema, required: true },
    order: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ApRegion', apRegionSchema);
