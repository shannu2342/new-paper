const express = require('express');
const { getSiteSettings, updateSiteSettings } = require('../controllers/siteSettingController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', getSiteSettings);
router.put('/', requireAuth, updateSiteSettings);

module.exports = router;
