const express = require('express');
const { seedAdmin, login, me } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimit');

const router = express.Router();

router.post('/seed', rateLimit({ windowMs: 60_000, max: 5 }), seedAdmin);
router.post('/login', rateLimit({ windowMs: 60_000, max: 20 }), login);
router.get('/me', requireAuth, me);

module.exports = router;
