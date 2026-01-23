const express = require('express');
const {
  listApRegions,
  createApRegion,
  updateApRegion,
  deleteApRegion,
  reorderApRegions
} = require('../controllers/apRegionController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', listApRegions);
router.post('/', requireAuth, createApRegion);
router.put('/reorder', requireAuth, reorderApRegions);
router.put('/:id', requireAuth, updateApRegion);
router.delete('/:id', requireAuth, deleteApRegion);

module.exports = router;
