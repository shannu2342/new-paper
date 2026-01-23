const express = require('express');
const { seedAdmin, login } = require('../controllers/authController');

const router = express.Router();

router.post('/seed', seedAdmin);
router.post('/login', login);

module.exports = router;
