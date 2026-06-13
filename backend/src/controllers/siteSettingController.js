const SiteSetting = require('../models/SiteSetting');

const defaultSettings = {
  regdOffice: {
    te: '#31-27-31/1, Kurmanapalem, Vadlapudi (Post), Visakhapatnam, Andhra Pradesh - 530046',
    en: '#31-27-31/1, Kurmanapalem, Vadlapudi (Post), Visakhapatnam, Andhra Pradesh - 530046'
  },
  stateOffice: {
    te: 'DNo: 26-3-134, Gandhinarar, NRP Road, Vijayawada, NTR Dist., Amaravati, Andhra Pradesh - 520003',
    en: 'DNo: 26-3-134, Gandhinarar, NRP Road, Vijayawada, NTR Dist., Amaravati, Andhra Pradesh - 520003'
  },
  address: {
    te: '#31-27-31/1, Kurmanapalem, Vadlapudi (Post), Visakhapatnam, Andhra Pradesh - 530046',
    en: '#31-27-31/1, Kurmanapalem, Vadlapudi (Post), Visakhapatnam, Andhra Pradesh - 530046'
  },
  contact: { te: 'సంప్రదింపు వివరాలు', en: 'Contact details' },
  phone: '',
  email: ''
};

const isBlankBilingual = (value) => {
  if (!value || typeof value !== 'object') return true;
  const en = (value.en || '').trim();
  const te = (value.te || '').trim();
  return !en && !te;
};

const normalizeSettings = (settings = {}) => ({
  ...defaultSettings,
  ...settings,
  regdOffice: { ...defaultSettings.regdOffice, ...(settings.regdOffice || {}) },
  stateOffice: { ...defaultSettings.stateOffice, ...(settings.stateOffice || {}) },
  address: isBlankBilingual(settings.address)
    ? { ...defaultSettings.address }
    : { ...defaultSettings.address, ...(settings.address || {}) },
  contact: isBlankBilingual(settings.contact)
    ? { ...defaultSettings.contact }
    : { ...defaultSettings.contact, ...(settings.contact || {}) }
});

const getSiteSettings = async (req, res) => {
  let settings = await SiteSetting.findOne({});
  if (!settings) {
    settings = await SiteSetting.create(defaultSettings);
  }
  return res.json(normalizeSettings(settings.toObject()));
};

const updateSiteSettings = async (req, res) => {
  const payload = normalizeSettings(req.body || {});
  const settings = await SiteSetting.findOneAndUpdate({}, payload, { upsert: true, new: true });
  return res.json(normalizeSettings(settings.toObject()));
};

module.exports = { getSiteSettings, updateSiteSettings };
