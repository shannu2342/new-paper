const express = require('express');
const {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories
} = require('../controllers/categoryController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', listCategories);
router.post('/', requireAuth, createCategory);
router.put('/reorder', requireAuth, reorderCategories);
router.put('/:id', requireAuth, updateCategory);
router.delete('/:id', requireAuth, deleteCategory);

module.exports = router;
