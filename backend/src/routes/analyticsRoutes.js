const express = require('express');
const { trackEvent, getSummary } = require('../controllers/analyticsController');
const { requireAuth, requireRole } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimit');

const router = express.Router();

router.post('/track', rateLimit({ windowMs: 60_000, max: 60 }), trackEvent);
router.get('/summary', requireAuth, requireRole('publisher', 'admin', 'super_admin'), getSummary);

module.exports = router;
