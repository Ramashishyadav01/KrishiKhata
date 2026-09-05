const express = require('express');
const router = express.Router();
const { getPayments, createPayment, deletePayment } = require('../controllers/paymentController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, getPayments);
router.post('/', protect, createPayment);
router.delete('/:id', protect, adminOnly, deletePayment);

module.exports = router;
