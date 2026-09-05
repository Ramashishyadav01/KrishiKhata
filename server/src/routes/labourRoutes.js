const express = require('express');
const router = express.Router();
const {
  getLabourers,
  getLabourById,
  createLabour,
  markLabourAttendance,
  createLabourPayment,
} = require('../controllers/labourController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getLabourers);
router.get('/:id', protect, getLabourById);
router.post('/', protect, createLabour);
router.post('/attendance', protect, markLabourAttendance);
router.post('/payment', protect, createLabourPayment);

module.exports = router;
