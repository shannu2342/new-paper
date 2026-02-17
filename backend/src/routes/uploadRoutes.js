const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const uploadPath = path.resolve(uploadDir);
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  }
});

const upload = multer({ storage });

router.get('/files', requireAuth, (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  fs.readdir(uploadPath, (err, files) => {
    if (err) {
      return res.status(500).json({ message: 'Unable to list files' });
    }
    const media = files
      .filter((name) => /\.(png|jpe?g|webp|gif|svg)$/i.test(name))
      .map((name) => ({
        name,
        url: `${baseUrl}/uploads/${name}`
      }))
      .sort((a, b) => (a.name < b.name ? 1 : -1));
    return res.json(media);
  });
});

router.post('/image', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  return res.json({ url: `/uploads/${req.file.filename}` });
});

router.post('/pdf', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  return res.json({ url: `/uploads/${req.file.filename}` });
});

module.exports = router;
