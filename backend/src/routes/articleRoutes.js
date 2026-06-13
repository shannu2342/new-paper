const express = require('express');
const {
  listArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  reviewArticle
} = require('../controllers/articleController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', listArticles);
router.get('/:id', getArticle);
router.post('/', requireAuth, requireRole('editor', 'publisher', 'admin', 'super_admin'), createArticle);
router.put('/:id', requireAuth, requireRole('editor', 'publisher', 'admin', 'super_admin'), updateArticle);
router.post('/:id/review', requireAuth, requireRole('publisher', 'admin', 'super_admin'), reviewArticle);
router.delete('/:id', requireAuth, requireRole('admin', 'super_admin'), deleteArticle);

module.exports = router;
