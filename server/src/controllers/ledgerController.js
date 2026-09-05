const WorkEntry = require('../models/WorkEntry');
const Payment = require('../models/Payment');
const Customer = require('../models/Customer');
const BranSale = require('../models/BranSale');

exports.getCustomerLedger = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const { season } = req.query;

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

    let workQuery = { customer: customerId, isDeleted: { $ne: true } };
    let payQuery = { customer: customerId, isDeleted: { $ne: true } };
    let branQuery = { customer: customerId };
    if (season) {
      workQuery.season = season;
      payQuery.season = season;
      branQuery.season = season;
    }

    const workEntries = await WorkEntry.find(workQuery).populate('machine field season driver');
    const payments = await Payment.find(payQuery).populate('season');
    const branSales = await BranSale.find(branQuery).populate('season');

    const ledger = [];

    workEntries.forEach((w) => {
      ledger.push({
        id: w._id,
        date: w.date,
        type: 'WORK',
        machine: w.machine ? `${w.machine.nameEn} (${w.machine.nameHi})` : 'Work',
        description: `Field: ${w.field ? w.field.name : w.village || 'N/A'} | ${w.description || ''}`,
        quantityDetails:
          w.billingUnit === 'Bigha'
            ? `${w.bigha} बीघा ${w.bissa} बिस्सा`
            : w.billingUnit === 'Hour'
            ? `${w.hours} घंटे (Hours)`
            : w.billingUnit === 'Trip'
            ? `${w.trips} चक्कर (Trips)`
            : `${w.quantity || 1} units`,
        rate: w.rate,
        debit: w.totalAmount, // Charge added
        credit: 0,
      });
    });

    payments.forEach((p) => {
      ledger.push({
        id: p._id,
        date: p.date,
        type: 'PAYMENT',
        machine: 'भुगतान (Payment)',
        description: `Method: ${p.paymentMethod} | Ref: ${p.reference || 'N/A'} ${p.notes ? '| ' + p.notes : ''}`,
        quantityDetails: '-',
        rate: 0,
        debit: 0,
        credit: p.amount, // Paid
      });
    });

    branSales.forEach((s) => {
      ledger.push({
        id: s._id,
        date: s.date,
        type: 'BRAN_SALE',
        machine: 'चोकर बिक्री (Bran Sale)',
        description: `Quantity: ${s.quantityQuintal} Qtl | Rate: ₹${s.ratePerQuintal}/Qtl | Received: ₹${s.amountReceived}`,
        quantityDetails: `${s.quantityQuintal} Qtl`,
        rate: s.ratePerQuintal,
        debit: s.totalSaleAmount,
        credit: s.amountReceived,
      });
    });

    // Chronological order
    ledger.sort((a, b) => new Date(a.date) - new Date(b.date));

    let runningBalance = 0;
    const ledgerWithBalance = ledger.map((item) => {
      runningBalance += item.debit - item.credit;
      return {
        ...item,
        runningBalance,
      };
    });

    const totalWork = workEntries.reduce((sum, w) => sum + w.totalAmount, 0) + branSales.reduce((sum, s) => sum + s.totalSaleAmount, 0);
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0) + branSales.reduce((sum, s) => sum + s.amountReceived, 0);
    const pendingBalance = totalWork - totalPaid;

    res.json({
      success: true,
      customer,
      summary: {
        totalWork,
        totalPaid,
        pendingBalance,
      },
      ledger: ledgerWithBalance.reverse(), // most recent first
    });
  } catch (error) {
    next(error);
  }
};
