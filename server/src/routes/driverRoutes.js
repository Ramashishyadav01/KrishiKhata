const express = require('express');
const router = express.Router();
const {
  getDrivers,
  getDriverById,
  createDriver,
  markAttendance,
  createDriverPayment,
} = require('../controllers/driverController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getDrivers);
router.get('/:id', protect, getDriverById);
router.post('/', protect, createDriver);
router.post('/attendance', protect, markAttendance);
router.post('/payment', protect, createDriverPayment);

module.exports = router;
