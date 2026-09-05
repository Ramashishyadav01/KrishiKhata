const Customer = require('../models/Customer');
const WorkEntry = require('../models/WorkEntry');
const Payment = require('../models/Payment');
const Machine = require('../models/Machine');
const FuelEntry = require('../models/FuelEntry');
const Repair = require('../models/Repair');
const Driver = require('../models/Driver');
const DriverAttendance = require('../models/DriverAttendance');
const DriverPayment = require('../models/DriverPayment');
const Labour = require('../models/Labour');
const LabourAttendance = require('../models/LabourAttendance');
const LabourPayment = require('../models/LabourPayment');
const RiceMillEntry = require('../models/RiceMillEntry');
const BranSale = require('../models/BranSale');
const Expense = require('../models/Expense');
const Season = require('../models/Season');

exports.getReportData = async (req, res, next) => {
  try {
    const { reportType, season, startDate, endDate } = req.query;

    let query = {};
    if (season) query.season = season;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    let data = [];
    let headers = [];

    switch (reportType) {
      case 'customer_pending': {
        const customers = await Customer.find({ status: 'Active' }).lean();
        const customerIds = customers.map((c) => c._id);
        const workSums = await WorkEntry.aggregate([
          { $match: { customer: { $in: customerIds }, isDeleted: { $ne: true } } },
          { $group: { _id: '$customer', total: { $sum: '$totalAmount' } } },
        ]);
        const paySums = await Payment.aggregate([
          { $match: { customer: { $in: customerIds }, isDeleted: { $ne: true } } },
          { $group: { _id: '$customer', total: { $sum: '$amount' } } },
        ]);

        const wMap = {}, pMap = {};
        workSums.forEach((w) => (wMap[w._id.toString()] = w.total));
        paySums.forEach((p) => (pMap[p._id.toString()] = p.total));

        data = customers
          .map((c) => {
            const w = wMap[c._id.toString()] || 0;
            const p = pMap[c._id.toString()] || 0;
            return {
              name: c.name,
              mobile: c.mobile,
              village: c.village,
              totalWork: w,
              totalPaid: p,
              pending: Math.max(0, w - p),
            };
          })
          .filter((c) => c.pending > 0);

        headers = ['Customer Name', 'Mobile', 'Village', 'Total Work (₹)', 'Total Paid (₹)', 'Pending (₹)'];
        break;
      }

      case 'machine_income': {
        const entries = await WorkEntry.find({ isDeleted: { $ne: true }, ...query }).populate('machine');
        const map = {};
        entries.forEach((w) => {
          if (w.machine) {
            const name = `${w.machine.nameEn} (${w.machine.nameHi})`;
            if (!map[name]) map[name] = { name, unit: w.machine.billingUnit, totalEntries: 0, revenue: 0 };
            map[name].totalEntries += 1;
            map[name].revenue += w.totalAmount;
          }
        });
        data = Object.values(map);
        headers = ['Machine / Service', 'Billing Unit', 'Total Jobs', 'Total Revenue (₹)'];
        break;
      }

      case 'season_profit': {
        const seasons = await Season.find().sort({ startDate: -1 });
        const results = [];

        for (const s of seasons) {
          const wEntries = await WorkEntry.find({ season: s._id, isDeleted: { $ne: true } });
          const bSales = await BranSale.find({ season: s._id });
          const rMill = await RiceMillEntry.find({ season: s._id });
          const exps = await Expense.find({ season: s._id });

          const incomeWork = wEntries.reduce((sum, w) => sum + w.totalAmount, 0);
          const incomeBran = bSales.reduce((sum, b) => sum + b.totalSaleAmount, 0);
          const incomeMill = rMill.reduce((sum, r) => sum + r.totalProcessingCharge, 0);
          const totalIncome = incomeWork + incomeBran + incomeMill;

          const totalExpenses = exps.reduce((sum, e) => sum + e.amount, 0);
          const netProfit = totalIncome - totalExpenses;

          results.push({
            seasonName: s.name,
            status: s.status,
            incomeWork,
            incomeBran,
            incomeMill,
            totalIncome,
            totalExpenses,
            netProfit,
          });
        }
        data = results;
        headers = [
          'Season Name',
          'Status',
          'Machinery Income (₹)',
          'Bran Sales (₹)',
          'Rice Mill (₹)',
          'Total Income (₹)',
          'Total Expenses (₹)',
          'Net Profit (₹)',
        ];
        break;
      }

      default: {
        // Generic Work entries report fallback
        const entries = await WorkEntry.find({ isDeleted: { $ne: true }, ...query })
          .populate('customer field machine season driver')
          .sort({ date: -1 });

        data = entries.map((w) => ({
          date: new Date(w.date).toLocaleDateString('en-IN'),
          customer: w.customer ? w.customer.name : 'N/A',
          village: w.village || (w.field ? w.field.village : ''),
          machine: w.machine ? `${w.machine.nameEn} (${w.machine.nameHi})` : '',
          billingUnit: w.billingUnit,
          rate: w.rate,
          totalAmount: w.totalAmount,
          paidAmount: w.paidAmount,
          paymentStatus: w.paymentStatus,
        }));
        headers = [
          'Date',
          'Customer',
          'Village',
          'Machine / Service',
          'Billing Unit',
          'Rate (₹)',
          'Total Amount (₹)',
          'Paid Amount (₹)',
          'Status',
        ];
      }
    }

    res.json({ success: true, reportType, headers, data });
  } catch (error) {
    next(error);
  }
};
