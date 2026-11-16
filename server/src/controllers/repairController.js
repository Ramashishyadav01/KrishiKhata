const Repair = require('../models/Repair');
const Expense = require('../models/Expense');
const Season = require('../models/Season');
const { resolveOrCreateSeason } = require('../utils/seasonHelper');
const mongoose = require('mongoose');

exports.getRepairs = async (req, res, next) => {
  try {
    const { season, machine, status, startDate, endDate } = req.query;
    let query = {};
    if (season) query.season = season;
    if (machine) query.machine = machine;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const repairs = await Repair.find(query)
      .populate('machine', 'nameEn nameHi')
      .populate('season', 'name')
      .sort({ date: -1 });

    const totalCost = repairs.reduce((sum, r) => sum + (r.totalCost || 0), 0);

    res.json({
      success: true,
      count: repairs.length,
      summary: { totalCost },
      repairs,
    });
  } catch (error) {
    next(error);
  }
};

exports.createRepair = async (req, res, next) => {
  try {
    let { machine, date, season, problem, description, partsCost, labourCost, mechanic, status, notes } = req.body;

    season = await resolveOrCreateSeason(season);

    const parts = parseFloat(partsCost) || 0;
    const labour = parseFloat(labourCost) || 0;
    const totalCost = Math.round(parts + labour);

    const repair = await Repair.create({
      machine,
      date: date || new Date(),
      season,
      problem,
      description,
      partsCost: parts,
      labourCost: labour,
      totalCost,
      mechanic,
      status: status || 'Completed',
      notes,
    });

    // Auto-create unified expense entry
    await Expense.create({
      category: 'Repair',
      date: date || new Date(),
      season,
      amount: totalCost,
      description: `Repair for Machine: ${problem} (Parts: ₹${parts}, Labour: ₹${labour})`,
      vendor: mechanic,
      notes: `Linked Repair Entry ID: ${repair._id}`,
    });

    const populated = await Repair.findById(repair._id).populate('machine season');
    res.status(201).json({ success: true, repair: populated });
  } catch (error) {
    next(error);
  }
};

exports.updateRepair = async (req, res, next) => {
  try {
    const { problem, description, partsCost, labourCost, mechanic, status, notes } = req.body;
    const parts = parseFloat(partsCost) || 0;
    const labour = parseFloat(labourCost) || 0;
    const totalCost = Math.round(parts + labour);

    const repair = await Repair.findByIdAndUpdate(
      req.params.id,
      { problem, description, partsCost: parts, labourCost: labour, totalCost, mechanic, status, notes },
      { new: true }
    ).populate('machine season');

    res.json({ success: true, repair });
  } catch (error) {
    next(error);
  }
};

exports.deleteRepair = async (req, res, next) => {
  try {
    await Repair.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Repair record deleted' });
  } catch (error) {
    next(error);
  }
};
