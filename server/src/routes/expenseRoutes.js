const express = require('express');
const router = express.Router();
const { getExpenses, createExpense, deleteExpense } = require('../controllers/expenseController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, getExpenses);
router.post('/', protect, createExpense);
router.delete('/:id', protect, adminOnly, deleteExpense);

module.exports = router;
