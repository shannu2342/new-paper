const express = require('express');
const {
  listEpapers,
  createEpaper,
  updateEpaper,
  deleteEpaper
} = require('../controllers/epaperController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', listEpapers);
router.post('/', requireAuth, createEpaper);
router.put('/:id', requireAuth, updateEpaper);
router.delete('/:id', requireAuth, deleteEpaper);

module.exports = router;
