const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { requireAuth } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimit');

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

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml'];
const PDF_MIME_TYPES = ['application/pdf'];
const IMAGE_EXT = /\.(png|jpe?g|webp|avif|gif|svg)$/i;
const PDF_EXT = /\.pdf$/i;

const imageUpload = multer({
  storage,
  limits: { fileSize: Number(process.env.IMAGE_UPLOAD_MAX_BYTES || 8 * 1024 * 1024) },
  fileFilter: (req, file, cb) => {
    const validMime = IMAGE_MIME_TYPES.includes(file.mimetype);
    const validExt = IMAGE_EXT.test(file.originalname || '');
    if (!validMime || !validExt) {
      return cb(new Error('Invalid image file type'));
    }
    return cb(null, true);
  }
});

const pdfUpload = multer({
  storage,
  limits: { fileSize: Number(process.env.PDF_UPLOAD_MAX_BYTES || 25 * 1024 * 1024) },
  fileFilter: (req, file, cb) => {
    const validMime = PDF_MIME_TYPES.includes(file.mimetype);
    const validExt = PDF_EXT.test(file.originalname || '');
    if (!validMime || !validExt) {
      return cb(new Error('Invalid PDF file type'));
    }
    return cb(null, true);
  }
});

const handleUploadError = (err, res) => {
  if (!err) return false;
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large for upload' });
  }
  return res.status(400).json({ message: err.message || 'Upload failed' });
};

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

router.post('/image', requireAuth, rateLimit({ windowMs: 60_000, max: 30 }), (req, res) => {
  imageUpload.single('file')(req, res, (err) => {
    if (handleUploadError(err, res)) return;
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    return res.json({ url: `/uploads/${req.file.filename}` });
  });
});

router.post('/pdf', requireAuth, rateLimit({ windowMs: 60_000, max: 20 }), (req, res) => {
  pdfUpload.single('file')(req, res, (err) => {
    if (handleUploadError(err, res)) return;
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    return res.json({ url: `/uploads/${req.file.filename}` });
  });
});

module.exports = router;
