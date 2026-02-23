require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { connectDb } = require('../config/db');
const Article = require('../models/Article');
const Epaper = require('../models/Epaper');
const HeroImage = require('../models/HeroImage');
const SiteSetting = require('../models/SiteSetting');
const User = require('../models/User');

const run = async () => {
  await connectDb(process.env.MONGODB_URI);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outDir = path.resolve(process.env.BACKUP_DIR || `backups/${stamp}`);
  fs.mkdirSync(outDir, { recursive: true });

  const [articles, epapers, heroes, siteSettings, users] = await Promise.all([
    Article.find({}).lean(),
    Epaper.find({}).lean(),
    HeroImage.find({}).lean(),
    SiteSetting.find({}).lean(),
    User.find({}).select('username role createdAt updatedAt').lean()
  ]);

  const payload = {
    createdAt: new Date().toISOString(),
    counts: {
      articles: articles.length,
      epapers: epapers.length,
      heroes: heroes.length,
      siteSettings: siteSettings.length,
      users: users.length
    },
    articles,
    epapers,
    heroImages: heroes,
    siteSettings,
    users
  };

  fs.writeFileSync(path.join(outDir, 'data.json'), JSON.stringify(payload, null, 2), 'utf8');
  console.log(`Backup completed: ${path.join(outDir, 'data.json')}`);
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
