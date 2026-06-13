const express = require('express');
const {
  listDistricts,
  createDistrict,
  updateDistrict,
  deleteDistrict,
  reorderDistricts
} = require('../controllers/districtController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', listDistricts);
router.post('/', requireAuth, createDistrict);
router.put('/reorder', requireAuth, reorderDistricts);
router.put('/:id', requireAuth, updateDistrict);
router.delete('/:id', requireAuth, deleteDistrict);

module.exports = router;
