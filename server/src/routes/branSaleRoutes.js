const express = require('express');
const router = express.Router();
const { getBranSales, createBranSale, deleteBranSale } = require('../controllers/branSaleController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, getBranSales);
router.post('/', protect, createBranSale);
router.delete('/:id', protect, adminOnly, deleteBranSale);

module.exports = router;
