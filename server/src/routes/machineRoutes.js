const express = require('express');
const router = express.Router();
const { getMachines, createMachine, updateMachine, deleteMachine } = require('../controllers/machineController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, getMachines);
router.post('/', protect, adminOnly, createMachine);
router.put('/:id', protect, updateMachine);
router.delete('/:id', protect, adminOnly, deleteMachine);

module.exports = router;
