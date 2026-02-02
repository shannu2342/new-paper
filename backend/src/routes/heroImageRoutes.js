const express = require('express');
const {
    listHeroImages,
    createHeroImage,
    updateHeroImage,
    deleteHeroImage
} = require('../controllers/heroImageController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', listHeroImages);
router.post('/', requireAuth, createHeroImage);
router.put('/:id', requireAuth, updateHeroImage);
router.delete('/:id', requireAuth, deleteHeroImage);

module.exports = router;
