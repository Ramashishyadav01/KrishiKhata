const RiceMillEntry = require('../models/RiceMillEntry');
const BranSale = require('../models/BranSale');

exports.getRiceMillEntries = async (req, res, next) => {
  try {
    const { season, customer } = req.query;
    let query = {};
    if (season) query.season = season;
    if (customer) query.customer = customer;

    const entries = await RiceMillEntry.find(query)
      .populate('customer', 'name mobile village')
      .populate('season', 'name')
      .sort({ date: -1 });

    // Inventory calculation
    const totalProcessed = entries.reduce((sum, e) => sum + (e.riceProcessedQuintal || 0), 0);
    const totalBranProduced = entries.reduce((sum, e) => sum + (e.branProducedQuintal || 0), 0);

    const branSalesQuery = season ? { season } : {};
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
    const {
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

    const processed = parseFloat(riceProcessedQuintal) || 0;
    const bran = parseFloat(branProducedQuintal) || 0;
    const rate = parseFloat(processingRatePerQuintal) || 0;
    const totalProcessingCharge = Math.round(processed * rate);

    const entry = await RiceMillEntry.create({
      date: date || new Date(),
      season,
      customer: customer || null,
      customerName,
      riceProcessedQuintal: processed,
      branProducedQuintal: bran,
      processingRatePerQuintal: rate,
      totalProcessingCharge,
      electricityCost: parseFloat(electricityCost) || 0,
      labourCost: parseFloat(labourCost) || 0,
      otherCosts: parseFloat(otherCosts) || 0,
      notes,
    });

    const populated = await RiceMillEntry.findById(entry._id).populate('customer season');
    res.status(201).json({ success: true, entry: populated });
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
