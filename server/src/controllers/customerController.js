const Customer = require('../models/Customer');
const Field = require('../models/Field');
const WorkEntry = require('../models/WorkEntry');
const Payment = require('../models/Payment');
const RiceMillEntry = require('../models/RiceMillEntry');
const BranSale = require('../models/BranSale');

exports.getCustomers = async (req, res, next) => {
  try {
    const { search, village, status } = req.query;
    let query = {};
    if (status && status !== 'All' && status !== 'all') {
      query.status = new RegExp(`^${status}$`, 'i');
    }
    if (village) query.village = new RegExp(village, 'i');
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { mobile: new RegExp(search, 'i') },
        { village: new RegExp(search, 'i') },
      ];
    }

    const customers = await Customer.find(query).sort({ name: 1 }).lean();

    // Attach summary financials to each customer
    const customerIds = customers.map((c) => c._id);

    const workSums = await WorkEntry.aggregate([
      { $match: { customer: { $in: customerIds }, isDeleted: { $ne: true } } },
      { $group: { _id: '$customer', totalWork: { $sum: '$totalAmount' } } },
    ]);

    const paySums = await Payment.aggregate([
      { $match: { customer: { $in: customerIds }, isDeleted: { $ne: true } } },
      { $group: { _id: '$customer', totalPaid: { $sum: '$amount' } } },
    ]);

    const branSums = await BranSale.aggregate([
      { $match: { customer: { $in: customerIds } } },
      { $group: { _id: '$customer', totalBranSale: { $sum: '$totalSaleAmount' }, totalBranPaid: { $sum: '$amountReceived' } } },
    ]);

    const workMap = {};
    workSums.forEach((w) => (workMap[w._id.toString()] = w.totalWork));

    const payMap = {};
    paySums.forEach((p) => (payMap[p._id.toString()] = p.totalPaid));

    const branSaleMap = {};
    const branPaidMap = {};
    branSums.forEach((b) => {
      const id = b._id.toString();
      branSaleMap[id] = b.totalBranSale;
      branPaidMap[id] = b.totalBranPaid;
    });

    const customersWithFinancials = customers.map((cust) => {
      const id = cust._id.toString();
      const totalWork = (workMap[id] || 0) + (branSaleMap[id] || 0);
      const totalPaid = (payMap[id] || 0) + (branPaidMap[id] || 0);
      const pending = Math.max(0, totalWork - totalPaid);
      return {
        ...cust,
        totalWork,
        totalPaid,
        pending,
      };
    });

    res.json({ success: true, count: customersWithFinancials.length, customers: customersWithFinancials });
  } catch (error) {
    next(error);
  }
};

exports.getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

    const fields = await Field.find({ customer: customer._id }).sort({ name: 1 });
    const workEntries = await WorkEntry.find({ customer: customer._id, isDeleted: { $ne: true } })
      .populate('field machine season driver')
      .sort({ date: -1 });
    const payments = await Payment.find({ customer: customer._id, isDeleted: { $ne: true } })
      .populate('season')
      .sort({ date: -1 });
    const branSales = await BranSale.find({ customer: customer._id }).sort({ date: -1 });

    // Calculate Customer Financial Totals
    const totalWork = workEntries.reduce((sum, w) => sum + (w.totalAmount || 0), 0) + branSales.reduce((sum, s) => sum + (s.totalSaleAmount || 0), 0);
    const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0) + branSales.reduce((sum, s) => sum + (s.amountReceived || 0), 0);
    const pending = totalWork - totalPaid;

    // Combine into chronologically ordered Ledger (Khata)
    const ledger = [];
    workEntries.forEach((w) => {
      ledger.push({
        id: w._id,
        date: w.date,
        type: 'WORK',
        title: `${w.machine ? w.machine.nameEn + ' (' + w.machine.nameHi + ')' : 'Work'}`,
        description: `Field: ${w.field ? w.field.name : w.village || ''} | ${w.description || ''}`,
        debit: w.totalAmount, // Charge
        credit: 0,
      });
    });

    payments.forEach((p) => {
      ledger.push({
        id: p._id,
        date: p.date,
        type: 'PAYMENT',
        title: `Payment Received (${p.paymentMethod})`,
        description: `Ref: ${p.reference || 'Cash/UPI'} ${p.notes ? '| ' + p.notes : ''}`,
        debit: 0,
        credit: p.amount, // Payment received
      });
    });

    branSales.forEach((s) => {
      ledger.push({
        id: s._id,
        date: s.date,
        type: 'BRAN_SALE',
        title: `Bran Sale (चोकर बिक्री - ${s.quantityQuintal} Qtl @ ₹${s.ratePerQuintal})`,
        description: `Total: ₹${s.totalSaleAmount} | Received: ₹${s.amountReceived} | Method: ${s.paymentMethod}`,
        debit: s.totalSaleAmount,
        credit: s.amountReceived,
      });
    });

    // Sort ascending by date for running balance calculation
    ledger.sort((a, b) => new Date(a.date) - new Date(b.date));

    let runningBalance = 0;
    const ledgerWithBalance = ledger.map((item) => {
      runningBalance += item.debit - item.credit;
      return {
        ...item,
        runningBalance,
      };
    });

    res.json({
      success: true,
      customer,
      fields,
      financials: {
        totalWork,
        totalPaid,
        pending,
      },
      workEntries,
      payments,
      branSales,
      ledger: ledgerWithBalance.reverse(), // latest first for UI
    });
  } catch (error) {
    next(error);
  }
};

exports.createCustomer = async (req, res, next) => {
  try {
    const { name, mobile, village, address, notes } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Farmer name (किसान का नाम) is required' });
    }

    const cleanName = name.trim();
    const cleanMobile = mobile ? mobile.toString().trim() : '';
    const cleanVillage = village ? village.trim() : '';

    if (cleanMobile) {
      if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
        return res.status(400).json({ success: false, message: 'Invalid mobile number. Must be a 10-digit Indian mobile number.' });
      }
      const existingByMobile = await Customer.findOne({ mobile: cleanMobile });
      if (existingByMobile) {
        return res.status(400).json({
          success: false,
          message: 'This mobile number is already registered.',
          existingCustomer: existingByMobile,
        });
      }
    } else if (cleanVillage) {
      const existingByNameVillage = await Customer.findOne({
        name: new RegExp(`^${cleanName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i'),
        village: new RegExp(`^${cleanVillage.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i'),
      });
      if (existingByNameVillage) {
        return res.status(400).json({
          success: false,
          message: 'A farmer with this name and village already exists.',
          existingCustomer: existingByNameVillage,
        });
      }
    }

    const customer = await Customer.create({
      name: cleanName,
      mobile: cleanMobile || undefined,
      village: cleanVillage,
      address: address ? address.trim() : '',
      notes: notes ? notes.trim() : '',
      status: 'Active',
    });

    res.status(201).json({
      success: true,
      message: 'Farmer added successfully.',
      customer,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, message: 'Farmer details updated successfully.', customer });
  } catch (error) {
    next(error);
  }
};

exports.deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }

    const customerId = customer._id;

    // Check all linked records across modules
    const hasFields = await Field.exists({ customer: customerId });
    const hasWork = await WorkEntry.exists({ customer: customerId });
    const hasPayments = await Payment.exists({ customer: customerId });
    const hasRiceMill = await RiceMillEntry.exists({ customer: customerId });
    const hasBranSale = await BranSale.exists({ customer: customerId });

    if (hasFields || hasWork || hasPayments || hasRiceMill || hasBranSale) {
      return res.status(409).json({
        success: false,
        hasLinkedRecords: true,
        message: 'यह किसान पुराने रिकॉर्ड से जुड़ा हुआ है, इसलिए इसे डिलीट नहीं किया जा सकता। (This farmer has existing work or financial records and cannot be permanently deleted.)',
      });
    }

    await Customer.findByIdAndDelete(customerId);
    res.json({ success: true, message: 'Farmer deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
