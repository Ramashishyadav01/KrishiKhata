const RiceMillEntry = require('../models/RiceMillEntry');
const BranSale = require('../models/BranSale');
const Season = require('../models/Season');
const Customer = require('../models/Customer');
const { resolveOrCreateSeason } = require('../utils/seasonHelper');
const mongoose = require('mongoose');

exports.getRiceMillEntries = async (req, res, next) => {
  try {
    const { season, customer } = req.query;
    let query = {};
    if (season && season !== 'undefined' && season !== 'null' && season !== '') {
      if (mongoose.Types.ObjectId.isValid(season)) {
        query.season = season;
      }
    }
    if (customer && customer !== 'undefined' && customer !== 'null' && customer !== '') {
      if (mongoose.Types.ObjectId.isValid(customer)) {
        query.customer = customer;
      }
    }

    const entries = await RiceMillEntry.find(query)
      .populate('customer', 'name mobile village')
      .populate('season', 'name')
      .sort({ date: -1 });

    // Inventory calculation
    const totalProcessed = entries.reduce((sum, e) => sum + (e.riceProcessedQuintal || 0), 0);
    const totalBranProduced = entries.reduce((sum, e) => sum + (e.branProducedQuintal || 0), 0);

    const branSalesQuery = query.season ? { season: query.season } : {};
    const branSales = await BranSale.find(branSalesQuery);
    const totalBranSold = branSales.reduce((sum, s) => sum + (s.quantityQuintal || 0), 0);
    const remainingBran = Math.max(0, totalBranProduced - totalBranSold);

    res.json({
      success: true,
      count: entries.length,
      inventory: {
        totalProcessed,
        totalBranProduced,
        totalBranSold,
        remainingBran,
      },
      entries,
    });
  } catch (error) {
    next(error);
  }
};

exports.createRiceMillEntry = async (req, res, next) => {
  try {
    let {
      date,
      season,
      customer,
      customerName,
      riceProcessedQuintal,
      branProducedQuintal,
      processingRatePerQuintal,
      electricityCost,
      labourCost,
      otherCosts,
      notes,
    } = req.body;

    const processed = parseFloat(riceProcessedQuintal);
    if (isNaN(processed) || processed <= 0) {
      return res.status(400).json({ success: false, message: 'Rice processed (Quintal) must be greater than 0' });
    }

    const bran = parseFloat(branProducedQuintal);
    if (isNaN(bran) || bran < 0) {
      return res.status(400).json({ success: false, message: 'Bran produced (Quintal) cannot be negative' });
    }

    const rate = parseFloat(processingRatePerQuintal) || 0;
    const totalProcessingCharge = Math.round(processed * rate);

    // Resolve season if not provided, empty string, or invalid ObjectId
    season = await resolveOrCreateSeason(season);

    // Resolve customer and customerName
    let validCustomer = undefined;
    if (customer && mongoose.Types.ObjectId.isValid(customer)) {
      validCustomer = customer;
      if (!customerName) {
        const cust = await Customer.findById(customer);
        if (cust) customerName = cust.name;
      }
    }

    const entry = await RiceMillEntry.create({
      date: date || new Date(),
      season,
      customer: validCustomer,
      customerName: customerName ? customerName.trim() : undefined,
      riceProcessedQuintal: processed,
      branProducedQuintal: bran,
      processingRatePerQuintal: rate,
      totalProcessingCharge,
      electricityCost: parseFloat(electricityCost) || 0,
      labourCost: parseFloat(labourCost) || 0,
      otherCosts: parseFloat(otherCosts) || 0,
      notes: notes ? notes.trim() : undefined,
    });

    const populated = await RiceMillEntry.findById(entry._id).populate('customer season');
    res.status(201).json({ success: true, message: 'Rice Mill entry logged successfully', entry: populated });
  } catch (error) {
    next(error);
  }
};

exports.deleteRiceMillEntry = async (req, res, next) => {
  try {
    await RiceMillEntry.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Rice Mill entry deleted' });
  } catch (error) {
    next(error);
  }
};
