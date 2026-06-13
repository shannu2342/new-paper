const LanguageSetting = require('../models/LanguageSetting');

const getLanguageSettings = async (req, res) => {
  let settings = await LanguageSetting.findOne({});
  if (!settings) {
    settings = await LanguageSetting.create({ defaultLanguage: 'en', supported: ['te', 'en'] });
  }
  return res.json(settings);
};

const updateLanguageSettings = async (req, res) => {
  const settings = await LanguageSetting.findOneAndUpdate({}, req.body, { upsert: true, new: true });
  return res.json(settings);
};

module.exports = { getLanguageSettings, updateLanguageSettings };
