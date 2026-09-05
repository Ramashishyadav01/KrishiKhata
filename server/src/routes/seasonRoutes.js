const express = require('express');
const router = express.Router();
const { getSeasons, createSeason, updateSeason } = require('../controllers/seasonController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, getSeasons);
router.post('/', protect, adminOnly, createSeason);
router.put('/:id', protect, adminOnly, updateSeason);

module.exports = router;
