const mongoose = require('mongoose');

const bilingualTextSchema = new mongoose.Schema(
  {
    te: { type: String, required: true, trim: true },
    en: { type: String, required: true, trim: true }
  },
  { _id: false }
);

module.exports = { bilingualTextSchema };
