require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { connectDb } = require('../config/db');
const Article = require('../models/Article');
const Epaper = require('../models/Epaper');
const HeroImage = require('../models/HeroImage');
const SiteSetting = require('../models/SiteSetting');

const run = async () => {
  const input = process.argv[2];
  if (!input) {
    console.error('Usage: node src/tools/restoreData.js <backup-json-file>');
    process.exit(1);
  }
  const filePath = path.resolve(input);
  if (!fs.existsSync(filePath)) {
    console.error(`Backup file not found: ${filePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  await connectDb(process.env.MONGODB_URI);

  if (!process.env.RESTORE_CONFIRM || process.env.RESTORE_CONFIRM !== 'YES') {
    console.error('Set RESTORE_CONFIRM=YES to run restore.');
    process.exit(1);
  }

  await Promise.all([
    Article.deleteMany({}),
    Epaper.deleteMany({}),
    HeroImage.deleteMany({}),
    SiteSetting.deleteMany({})
  ]);

  if (Array.isArray(data.articles) && data.articles.length) await Article.insertMany(data.articles);
  if (Array.isArray(data.epapers) && data.epapers.length) await Epaper.insertMany(data.epapers);
  if (Array.isArray(data.heroImages) && data.heroImages.length) await HeroImage.insertMany(data.heroImages);
  if (Array.isArray(data.siteSettings) && data.siteSettings.length) await SiteSetting.insertMany(data.siteSettings);

  console.log('Restore completed.');
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
