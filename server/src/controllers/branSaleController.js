const BranSale = require('../models/BranSale');
const RiceMillEntry = require('../models/RiceMillEntry');
const Season = require('../models/Season');
const mongoose = require('mongoose');

exports.getBranSales = async (req, res, next) => {
  try {
    const { season, buyer } = req.query;
    let query = {};
    if (season) query.season = season;
    if (buyer) query.buyer = new RegExp(buyer, 'i');

    const sales = await BranSale.find(query).populate('season', 'name').populate('customer', 'name mobile village').sort({ date: -1 });

    const totalQuantity = sales.reduce((sum, s) => sum + (s.quantityQuintal || 0), 0);
    const totalSalesAmount = sales.reduce((sum, s) => sum + (s.totalSaleAmount || 0), 0);
    const totalReceived = sales.reduce((sum, s) => sum + (s.amountReceived || 0), 0);
    const totalPending = sales.reduce((sum, s) => sum + (s.pendingAmount || 0), 0);

    // Calculate inventory
    const riceMillQuery = season ? { season } : {};
    const riceMillEntries = await RiceMillEntry.find(riceMillQuery);
    const totalBranProduced = riceMillEntries.reduce((sum, e) => sum + (e.branProducedQuintal || 0), 0);
    const remainingBran = Math.max(0, totalBranProduced - totalQuantity);

    res.json({
      success: true,
      count: sales.length,
      summary: {
        totalBranProduced,
        totalQuantitySold: totalQuantity,
        remainingBran,
        totalSalesAmount,
        totalReceived,
        totalPending,
      },
      sales,
    });
  } catch (error) {
    next(error);
  }
};

exports.createBranSale = async (req, res, next) => {
  try {
    let { date, season, customer, buyer, buyerMobile, quantityQuintal, ratePerQuintal, amountReceived, paymentMethod, notes } = req.body;

    if (!buyer || !buyer.trim()) {
      return res.status(400).json({ success: false, message: 'Buyer / Farmer name is required' });
    }

    const qty = parseFloat(quantityQuintal);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity (Quintal) must be a positive number' });
    }

    const rate = parseFloat(ratePerQuintal);
    if (isNaN(rate) || rate <= 0) {
      return res.status(400).json({ success: false, message: 'Rate per Quintal must be a positive number' });
    }

    const received = parseFloat(amountReceived) || 0;
    if (received < 0) {
      return res.status(400).json({ success: false, message: 'Amount received cannot be negative' });
    }

    const totalAmount = Math.round(qty * rate);
    if (received > totalAmount) {
      return res.status(400).json({ success: false, message: 'Amount received cannot be greater than total amount.' });
    }

    const pending = Math.max(0, totalAmount - received);

    // Resolve season if not provided or empty string
    if (!season || !mongoose.Types.ObjectId.isValid(season)) {
      const activeSeason = await Season.findOne({ status: 'Active' }) || await Season.findOne().sort({ startDate: -1 });
      if (!activeSeason) {
        return res.status(400).json({ success: false, message: 'No active crop season found. Please create a season first.' });
      }
      season = activeSeason._id;
    }

    const validCustomer = customer && mongoose.Types.ObjectId.isValid(customer) ? customer : undefined;

    const sale = await BranSale.create({
      date: date || new Date(),
      season,
      customer: validCustomer,
      buyer: buyer.trim(),
      buyerMobile: buyerMobile ? buyerMobile.toString().trim() : undefined,
      quantityQuintal: qty,
      ratePerQuintal: rate,
      totalSaleAmount: totalAmount,
      amountReceived: received,
      pendingAmount: pending,
      paymentMethod: paymentMethod || 'Cash',
      notes: notes ? notes.trim() : undefined,
    });

    const populated = await BranSale.findById(sale._id).populate('season customer');
    res.status(201).json({ success: true, message: 'Bran sale created successfully', branSale: populated });
  } catch (error) {
    next(error);
  }
};

exports.deleteBranSale = async (req, res, next) => {
  try {
    await BranSale.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Bran sale record deleted' });
  } catch (error) {
    next(error);
  }
};
