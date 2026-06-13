const MenuSetting = require('../models/MenuSetting');

const defaultHeaderItems = [
  { key: 'home', title: { te: 'హోమ్', en: 'Home' }, order: 0 },
  { key: 'amaravati', title: { te: 'అమరావతి', en: 'Amaravati' }, order: 1 },
  { key: 'ap', title: { te: 'ఆంధ్రప్రదేశ్', en: 'Andhra Pradesh' }, order: 2 },
  { key: 'international', title: { te: 'అంతర్జాతీయం', en: 'International' }, order: 3 },
  { key: 'national', title: { te: 'జాతీయ', en: 'National' }, order: 4 },
  { key: 'sports', title: { te: 'క్రీడలు', en: 'Sports' }, order: 5 },
  { key: 'cinema', title: { te: 'సినిమా', en: 'Cinema' }, order: 6 },
  { key: 'other', title: { te: 'ఇతరాలు', en: 'Other' }, order: 7 }
];

const getMenuSettings = async (req, res) => {
  let settings = await MenuSetting.findOne({});
  if (!settings) {
    settings = await MenuSetting.create({ headerItems: defaultHeaderItems });
  }
  return res.json(settings);
};

const updateMenuSettings = async (req, res) => {
  const { headerItems } = req.body;
  if (!Array.isArray(headerItems) || headerItems.length !== 8) {
    return res.status(400).json({ message: 'headerItems must contain exactly 8 items' });
  }
  const settings = await MenuSetting.findOneAndUpdate(
    {},
    { headerItems },
    { upsert: true, new: true }
  );
  return res.json(settings);
};

module.exports = { getMenuSettings, updateMenuSettings };
