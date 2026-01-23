const mongoose = require('mongoose');
const { bilingualTextSchema } = require('./bilingualText');

const siteSettingSchema = new mongoose.Schema(
  {
    address: { type: bilingualTextSchema, required: true },
    contact: { type: bilingualTextSchema, required: true },
    phone: { type: String, default: '' },
    email: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteSetting', siteSettingSchema);
