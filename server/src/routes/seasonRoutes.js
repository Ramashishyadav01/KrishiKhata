const express = require('express');
const router = express.Router();
const { getSeasons, createSeason, updateSeason } = require('../controllers/seasonController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getSeasons);
router.post('/', protect, createSeason);
router.put('/:id', protect, updateSeason);

module.exports = router;
