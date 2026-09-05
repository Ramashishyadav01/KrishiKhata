const express = require('express');
const router = express.Router();
const {
  getWorkEntries,
  getWorkEntryById,
  createWorkEntry,
  updateWorkEntry,
  deleteWorkEntry,
} = require('../controllers/workEntryController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, getWorkEntries);
router.get('/:id', protect, getWorkEntryById);
router.post('/', protect, createWorkEntry);
router.put('/:id', protect, updateWorkEntry);
router.delete('/:id', protect, adminOnly, deleteWorkEntry);

module.exports = router;
