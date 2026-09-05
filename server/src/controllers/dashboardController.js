const WorkEntry = require('../models/WorkEntry');
const Payment = require('../models/Payment');
const Customer = require('../models/Customer');
const Expense = require('../models/Expense');
const BranSale = require('../models/BranSale');
const RiceMillEntry = require('../models/RiceMillEntry');
const Driver = require('../models/Driver');
const DriverAttendance = require('../models/DriverAttendance');
const DriverPayment = require('../models/DriverPayment');
const Labour = require('../models/Labour');
const LabourAttendance = require('../models/LabourAttendance');
const LabourPayment = require('../models/LabourPayment');
const FuelEntry = require('../models/FuelEntry');
const Repair = require('../models/Repair');
const Machine = require('../models/Machine');

exports.getDashboardSummary = async (req, res, next) => {
  try {
    const { season } = req.query;

    const workMatch = { isDeleted: { $ne: true } };
    const payMatch = { isDeleted: { $ne: true } };
    const expMatch = {};
    const branMatch = {};
    const millMatch = {};
    const fuelMatch = {};
    const repairMatch = {};

    if (season) {
      workMatch.season = season;
      payMatch.season = season;
      expMatch.season = season;
      branMatch.season = season;
      millMatch.season = season;
      fuelMatch.season = season;
      repairMatch.season = season;
    }

    // 1. Work Income
    const workEntries = await WorkEntry.find(workMatch).populate('machine');
    const totalWorkIncome = workEntries.reduce((sum, w) => sum + (w.totalAmount || 0), 0);

    // 2. Customer Payments Received
    const payments = await Payment.find(payMatch);
    const totalPaymentsReceived = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // 3. Customer Pending
    const customerPending = Math.max(0, totalWorkIncome - totalPaymentsReceived);

    // 4. Bran Sales Income & Received & Pending
    const branSales = await BranSale.find(branMatch);
    const totalBranIncome = branSales.reduce((sum, s) => sum + (s.totalSaleAmount || 0), 0);
    const totalBranReceived = branSales.reduce((sum, s) => sum + (s.amountReceived || 0), 0);
    const branPending = Math.max(0, totalBranIncome - totalBranReceived);

    // 5. Rice Mill Charges Income
    const riceMillEntries = await RiceMillEntry.find(millMatch);
    const totalRiceMillIncome = riceMillEntries.reduce((sum, m) => sum + (m.totalProcessingCharge || 0), 0);

    // TOTAL GROSS INCOME
    const totalIncome = totalWorkIncome + totalBranIncome + totalRiceMillIncome;

    // TOTAL CASH RECEIVED
    const totalReceived = totalPaymentsReceived + totalBranReceived;

    // 6. Expenses Breakdown & Total Expenses
    const expenses = await Expense.find(expMatch);
    const totalGeneralExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const fuelEntries = await FuelEntry.find(fuelMatch);
    const totalFuelCost = fuelEntries.reduce((sum, f) => sum + (f.totalAmount || 0), 0);

    const repairs = await Repair.find(repairMatch);
    const totalRepairCost = repairs.reduce((sum, r) => sum + (r.totalCost || 0), 0);

    // 7. Driver Payables
    const drivers = await Driver.find({ status: 'Active' });
    const driverIds = drivers.map((d) => d._id);
    const dAtt = await DriverAttendance.aggregate([
      { $match: { driver: { $in: driverIds } } },
      { $group: { _id: '$driver', earned: { $sum: '$dailyEarned' } } },
    ]);
    const dPay = await DriverPayment.aggregate([
      { $match: { driver: { $in: driverIds } } },
      { $group: { _id: '$driver', paid: { $sum: '$amount' } } },
    ]);

    const dEarnedMap = {};
    dAtt.forEach((a) => (dEarnedMap[a._id.toString()] = a.earned));
    const dPaidMap = {};
    dPay.forEach((p) => (dPaidMap[p._id.toString()] = p.paid));

    let totalDriverEarned = 0;
    let totalDriverPaid = 0;

    drivers.forEach((d) => {
      const id = d._id.toString();
      const earned = d.salaryType === 'Monthly' ? d.monthlySalary : dEarnedMap[id] || 0;
      const paid = dPaidMap[id] || 0;
      totalDriverEarned += earned;
      totalDriverPaid += paid;
    });
    const driverPending = Math.max(0, totalDriverEarned - totalDriverPaid);

    // 8. Labour Payables
    const labourers = await Labour.find({ status: 'Active' });
    const labourIds = labourers.map((l) => l._id);
    const lAtt = await LabourAttendance.aggregate([
      { $match: { labour: { $in: labourIds } } },
      { $group: { _id: '$labour', earned: { $sum: '$dailyEarned' } } },
    ]);
    const lPay = await LabourPayment.aggregate([
      { $match: { labour: { $in: labourIds } } },
      { $group: { _id: '$labour', paid: { $sum: '$amount' } } },
    ]);

    let totalLabourEarned = 0;
    let totalLabourPaid = 0;
    const lEarnedMap = {};
    lAtt.forEach((a) => (lEarnedMap[a._id.toString()] = a.earned));
    const lPaidMap = {};
    lPay.forEach((p) => (lPaidMap[p._id.toString()] = p.paid));

    labourers.forEach((l) => {
      const id = l._id.toString();
      const earned = lEarnedMap[id] || 0;
      const paid = lPaidMap[id] || 0;
      totalLabourEarned += earned;
      totalLabourPaid += paid;
    });
    const labourPending = Math.max(0, totalLabourEarned - totalLabourPaid);

    // NET PROFIT
    const totalExpenses = totalGeneralExpenses;
    const netProfit = totalIncome - totalExpenses;

    // Machine-wise revenue data for charts
    const machineMap = {};
    workEntries.forEach((w) => {
      if (w.machine) {
        const name = `${w.machine.nameEn} (${w.machine.nameHi})`;
        machineMap[name] = (machineMap[name] || 0) + w.totalAmount;
      }
    });
    if (totalBranIncome > 0) machineMap['Bran (चोकर)'] = totalBranIncome;
    if (totalRiceMillIncome > 0) machineMap['Rice Mill (राइस मिल)'] = totalRiceMillIncome;

    const machineRevenueChart = Object.keys(machineMap).map((name) => ({
      name,
      revenue: machineMap[name],
    }));

    // Expense breakdown for pie chart
    const expCategoryMap = {};
    expenses.forEach((e) => {
      expCategoryMap[e.category] = (expCategoryMap[e.category] || 0) + e.amount;
    });
    const expenseChart = Object.keys(expCategoryMap).map((cat) => ({
      category: cat,
      amount: expCategoryMap[cat],
    }));

    // Asset Counts
    const customerCount = await Customer.countDocuments({ status: 'Active' });
    const machineCount = await Machine.countDocuments({ status: 'Active' });

    res.json({
      success: true,
      summary: {
        totalIncome,
        totalReceived,
        customerPending,
        totalExpenses,
        netProfit,
        driverPending,
        labourPending,
        fuelCost: totalFuelCost,
        repairCost: totalRepairCost,
        branIncome: totalBranIncome,
        branPending,
        customerCount,
        machineCount,
        workCount: workEntries.length,
      },
      charts: {
        machineRevenue: machineRevenueChart,
        expenseBreakdown: expenseChart,
      },
    });
  } catch (error) {
    next(error);
  }
};
