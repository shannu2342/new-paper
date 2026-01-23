const mongoose = require('mongoose');

const languageSettingSchema = new mongoose.Schema(
  {
    defaultLanguage: { type: String, enum: ['te', 'en'], default: 'en' },
    supported: { type: [String], default: ['te', 'en'] }
  },
  { timestamps: true }
);

module.exports = mongoose.model('LanguageSetting', languageSettingSchema);
