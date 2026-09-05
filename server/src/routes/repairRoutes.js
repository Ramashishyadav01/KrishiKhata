const express = require('express');
const router = express.Router();
const { getRepairs, createRepair, updateRepair, deleteRepair } = require('../controllers/repairController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, getRepairs);
router.post('/', protect, createRepair);
router.put('/:id', protect, updateRepair);
router.delete('/:id', protect, adminOnly, deleteRepair);

module.exports = router;
