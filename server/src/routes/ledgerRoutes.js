const express = require('express');
const router = express.Router();
const { getCustomerLedger } = require('../controllers/ledgerController');
const { protect } = require('../middleware/auth');

router.get('/:customerId', protect, getCustomerLedger);

module.exports = router;
