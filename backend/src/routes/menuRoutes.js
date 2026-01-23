const express = require('express');
const { getMenuSettings, updateMenuSettings } = require('../controllers/menuController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', getMenuSettings);
router.put('/', requireAuth, updateMenuSettings);

module.exports = router;
