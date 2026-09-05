const Machine = require('../models/Machine');

exports.getMachines = async (req, res, next) => {
  try {
    const machines = await Machine.find().sort({ createdAt: 1 });
    res.json({ success: true, count: machines.length, machines });
  } catch (error) {
    next(error);
  }
};

exports.createMachine = async (req, res, next) => {
  try {
    const { nameEn, nameHi, billingUnit, defaultRate, status, notes } = req.body;
    const machine = await Machine.create({ nameEn, nameHi, billingUnit, defaultRate, status, notes });
    res.status(201).json({ success: true, machine });
  } catch (error) {
    next(error);
  }
};

exports.updateMachine = async (req, res, next) => {
  try {
    if (req.body.defaultRate !== undefined) {
      const numRate = Number(req.body.defaultRate);
      if (isNaN(numRate) || numRate < 0) {
        return res.status(400).json({ success: false, message: 'Default rate must be a valid non-negative number' });
      }
    }
    const machine = await Machine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!machine) return res.status(404).json({ success: false, message: 'Machine / Service not found' });
    res.json({ success: true, message: 'Rate updated successfully', machine });
  } catch (error) {
    next(error);
  }
};

exports.deleteMachine = async (req, res, next) => {
  try {
    await Machine.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Machine deleted successfully' });
  } catch (error) {
    next(error);
  }
};
