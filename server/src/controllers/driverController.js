const Driver = require('../models/Driver');
const DriverAttendance = require('../models/DriverAttendance');
const DriverPayment = require('../models/DriverPayment');
const Expense = require('../models/Expense');

exports.getDrivers = async (req, res, next) => {
  try {
    const drivers = await Driver.find().sort({ name: 1 }).lean();

    const driverIds = drivers.map((d) => d._id);

    // Calculate total earned via attendance
    const attendanceAgg = await DriverAttendance.aggregate([
      { $match: { driver: { $in: driverIds } } },
      { $group: { _id: '$driver', totalEarned: { $sum: '$dailyEarned' }, presentDays: { $sum: 1 } } },
    ]);

    // Calculate total paid via DriverPayment
    const paymentAgg = await DriverPayment.aggregate([
      { $match: { driver: { $in: driverIds } } },
      { $group: { _id: '$driver', totalPaid: { $sum: '$amount' } } },
    ]);

    const attMap = {};
    attendanceAgg.forEach((a) => (attMap[a._id.toString()] = a));

    const payMap = {};
    paymentAgg.forEach((p) => (payMap[p._id.toString()] = p.totalPaid));

    const driversWithFinancials = drivers.map((d) => {
      const id = d._id.toString();
      const att = attMap[id] || { totalEarned: 0, presentDays: 0 };
      const totalEarned = d.salaryType === 'Monthly' ? d.monthlySalary : att.totalEarned;
      const totalPaid = payMap[id] || 0;
      const pending = Math.max(0, totalEarned - totalPaid);

      return {
        ...d,
        totalEarned,
        totalPaid,
        pending,
        presentDays: att.presentDays,
      };
    });

    res.json({ success: true, count: driversWithFinancials.length, drivers: driversWithFinancials });
  } catch (error) {
    next(error);
  }
};

exports.getDriverById = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    const attendance = await DriverAttendance.find({ driver: driver._id })
      .populate('machine', 'nameEn nameHi')
      .sort({ date: -1 });

    const payments = await DriverPayment.find({ driver: driver._id }).populate('season', 'name').sort({ date: -1 });

    const totalEarned =
      driver.salaryType === 'Monthly'
        ? driver.monthlySalary
        : attendance.reduce((sum, a) => sum + (a.dailyEarned || 0), 0);
    const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const pending = totalEarned - totalPaid;

    res.json({
      success: true,
      driver,
      financials: { totalEarned, totalPaid, pending },
      attendance,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

exports.createDriver = async (req, res, next) => {
  try {
    const { name, mobile, address, joiningDate, salaryType, dailyRate, monthlySalary, notes } = req.body;
    const driver = await Driver.create({
      name,
      mobile,
      address,
      joiningDate,
      salaryType,
      dailyRate: parseFloat(dailyRate) || 0,
      monthlySalary: parseFloat(monthlySalary) || 0,
      notes,
    });
    res.status(201).json({ success: true, driver });
  } catch (error) {
    next(error);
  }
};

exports.markAttendance = async (req, res, next) => {
  try {
    const { driverId, date, status, machine, workPerformed, workingHours, notes } = req.body;

    const driver = await Driver.findById(driverId);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    let dailyEarned = 0;
    if (driver.salaryType === 'Daily') {
      if (status === 'Present') dailyEarned = driver.dailyRate;
      else if (status === 'Half Day') dailyEarned = Math.round(driver.dailyRate / 2);
    }

    const attendance = await DriverAttendance.findOneAndUpdate(
      { driver: driverId, date: new Date(date) },
      {
        driver: driverId,
        date: new Date(date),
        status,
        machine: machine || null,
        workPerformed,
        workingHours: parseFloat(workingHours) || 8,
        dailyEarned,
        notes,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('machine');

    res.json({ success: true, attendance });
  } catch (error) {
    next(error);
  }
};

exports.createDriverPayment = async (req, res, next) => {
  try {
    const { driverId, date, amount, paymentMethod, season, notes } = req.body;
    const pAmount = parseFloat(amount) || 0;

    const driverPayment = await DriverPayment.create({
      driver: driverId,
      date: date || new Date(),
      amount: pAmount,
      paymentMethod: paymentMethod || 'Cash',
      season,
      notes,
    });

    // Auto-create unified expense entry under category 'Driver'
    if (season) {
      const driver = await Driver.findById(driverId);
      await Expense.create({
        category: 'Driver',
        date: date || new Date(),
        season,
        amount: pAmount,
        description: `Driver Salary Paid: ${driver ? driver.name : 'Driver'} (${paymentMethod})`,
        notes: `Driver Payment ID: ${driverPayment._id}`,
      });
    }

    res.status(201).json({ success: true, driverPayment });
  } catch (error) {
    next(error);
  }
};
