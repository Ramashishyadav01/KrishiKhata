const express = require('express');
const router = express.Router();
const { getFields, createField, updateField, deleteField } = require('../controllers/fieldController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, getFields);
router.post('/', protect, createField);
router.put('/:id', protect, updateField);
router.delete('/:id', protect, adminOnly, deleteField);

module.exports = router;
