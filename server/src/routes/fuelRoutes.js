const express = require('express');
const router = express.Router();
const { getFuelEntries, createFuelEntry, deleteFuelEntry } = require('../controllers/fuelController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, getFuelEntries);
router.post('/', protect, createFuelEntry);
router.delete('/:id', protect, adminOnly, deleteFuelEntry);

module.exports = router;
