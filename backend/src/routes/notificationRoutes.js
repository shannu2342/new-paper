const express = require('express');
const { getPublicKey, subscribe, broadcast } = require('../controllers/notificationController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/public-key', getPublicKey);
router.post('/subscribe', subscribe);
router.post('/broadcast', requireAuth, broadcast);

module.exports = router;
