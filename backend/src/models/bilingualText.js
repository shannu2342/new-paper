const mongoose = require('mongoose');

const bilingualTextSchema = new mongoose.Schema(
  {
    te: { type: String, required: true, trim: true },
    en: { type: String, required: true, trim: true },
    hi: { type: String, trim: true, default: '' }
  },
  { _id: false }
);

module.exports = { bilingualTextSchema };
