require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const { connectDb } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const articleRoutes = require('./routes/articleRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const apRegionRoutes = require('./routes/apRegionRoutes');
const districtRoutes = require('./routes/districtRoutes');
const epaperRoutes = require('./routes/epaperRoutes');
const menuRoutes = require('./routes/menuRoutes');
const languageRoutes = require('./routes/languageRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const siteSettingRoutes = require('./routes/siteSettingRoutes');
const newsRoutes = require('./routes/newsRoutes');
const heroImageRoutes = require('./routes/heroImageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const uploadPath = path.resolve(uploadDir);
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}
app.use('/uploads', express.static(uploadPath));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/ap-regions', apRegionRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/epapers', epaperRoutes);
app.use('/api/menu-settings', menuRoutes);
app.use('/api/language-settings', languageRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/site-settings', siteSettingRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/hero-images', heroImageRoutes);
app.use('/api/notifications', notificationRoutes);

const port = process.env.PORT || 4000;

connectDb(process.env.MONGODB_URI)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  });
