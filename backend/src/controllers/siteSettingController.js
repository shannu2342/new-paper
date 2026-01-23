const SiteSetting = require('../models/SiteSetting');

const defaultSettings = {
  address: { te: 'మీ చిరునామా ఇక్కడ', en: 'Your address here' },
  contact: { te: 'సంప్రదింపు వివరాలు', en: 'Contact details' },
  phone: '',
  email: ''
};

const getSiteSettings = async (req, res) => {
  let settings = await SiteSetting.findOne({});
  if (!settings) {
    settings = await SiteSetting.create(defaultSettings);
  }
  return res.json(settings);
};

const updateSiteSettings = async (req, res) => {
  const settings = await SiteSetting.findOneAndUpdate({}, req.body, { upsert: true, new: true });
  return res.json(settings);
};

module.exports = { getSiteSettings, updateSiteSettings };
