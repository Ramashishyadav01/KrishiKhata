const express = require('express');
const router = express.Router();
const {
  getMachines,
  createMachine,
  updateMachine,
  deleteMachine,
  seedDefaultMachines,
} = require('../controllers/machineController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getMachines);
router.post('/', protect, createMachine);
router.post('/seed', protect, seedDefaultMachines);
router.put('/:id', protect, updateMachine);
router.delete('/:id', protect, deleteMachine);

module.exports = router;
