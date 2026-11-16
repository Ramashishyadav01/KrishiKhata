const FuelEntry = require('../models/FuelEntry');
const Expense = require('../models/Expense');
const Season = require('../models/Season');
const { resolveOrCreateSeason } = require('../utils/seasonHelper');
const mongoose = require('mongoose');

exports.getFuelEntries = async (req, res, next) => {
  try {
    const { season, machine, fuelType, startDate, endDate } = req.query;
    let query = {};
    if (season) query.season = season;
    if (machine) query.machine = machine;
    if (fuelType) query.fuelType = fuelType;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const entries = await FuelEntry.find(query)
      .populate('machine', 'nameEn nameHi')
      .populate('season', 'name')
      .sort({ date: -1 });

    const totalLitres = entries.reduce((sum, e) => sum + (e.quantity || 0), 0);
    const totalCost = entries.reduce((sum, e) => sum + (e.totalAmount || 0), 0);

    res.json({
      success: true,
      count: entries.length,
      summary: { totalLitres, totalCost },
      fuelEntries: entries,
    });
  } catch (error) {
    next(error);
  }
};

exports.createFuelEntry = async (req, res, next) => {
  try {
    let { date, season, machine, fuelType, quantity, ratePerLitre, meterReading, vendor, notes } = req.body;

    if (!machine || !mongoose.Types.ObjectId.isValid(machine)) {
      return res.status(400).json({ success: false, message: 'Please select a valid Machine / Vehicle' });
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive number' });
    }

    const rate = parseFloat(ratePerLitre);
    if (isNaN(rate) || rate <= 0) {
      return res.status(400).json({ success: false, message: 'Rate per litre must be a positive number' });
    }

    const totalAmount = Math.round(qty * rate);

    // Resolve season if not provided or empty string
    season = await resolveOrCreateSeason(season);

    const fuelEntry = await FuelEntry.create({
      date: date || new Date(),
      season,
      machine,
      fuelType: fuelType || 'Diesel',
      quantity: qty,
      ratePerLitre: rate,
      totalAmount,
      meterReading: meterReading ? meterReading.toString().trim() : undefined,
      vendor: vendor ? vendor.trim() : undefined,
      notes: notes ? notes.trim() : undefined,
    });

    // Also auto log to Expense schema for unified expense reporting
    await Expense.create({
      category: fuelType === 'Petrol' ? 'Petrol' : 'Diesel',
      date: date || new Date(),
      season,
      amount: totalAmount,
      description: `Fuel purchase: ${qty}L ${fuelType} @ ₹${rate}/L for Machine ID ${machine}`,
      vendor: vendor ? vendor.trim() : undefined,
      notes: `Linked Fuel Entry ID: ${fuelEntry._id}`,
    });

    const populated = await FuelEntry.findById(fuelEntry._id).populate('machine season');
    res.status(201).json({ success: true, message: 'Fuel entry logged successfully', fuelEntry: populated });
  } catch (error) {
    next(error);
  }
};

exports.deleteFuelEntry = async (req, res, next) => {
  try {
    await FuelEntry.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Fuel entry deleted' });
  } catch (error) {
    next(error);
  }
};
