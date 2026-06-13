const express = require('express');
const { getLanguageSettings, updateLanguageSettings } = require('../controllers/languageController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', getLanguageSettings);
router.put('/', requireAuth, updateLanguageSettings);

module.exports = router;
