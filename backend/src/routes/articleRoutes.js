const express = require('express');
const {
  listArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle
} = require('../controllers/articleController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', listArticles);
router.get('/:id', getArticle);
router.post('/', requireAuth, createArticle);
router.put('/:id', requireAuth, updateArticle);
router.delete('/:id', requireAuth, deleteArticle);

module.exports = router;
