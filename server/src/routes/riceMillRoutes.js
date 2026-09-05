const express = require('express');
const router = express.Router();
const { getRiceMillEntries, createRiceMillEntry, deleteRiceMillEntry } = require('../controllers/riceMillController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, getRiceMillEntries);
router.post('/', protect, createRiceMillEntry);
router.delete('/:id', protect, adminOnly, deleteRiceMillEntry);

module.exports = router;
