const Labour = require('../models/Labour');
const LabourAttendance = require('../models/LabourAttendance');
const LabourPayment = require('../models/LabourPayment');
const Expense = require('../models/Expense');

exports.getLabourers = async (req, res, next) => {
  try {
    const labourers = await Labour.find().sort({ name: 1 }).lean();

    const labourIds = labourers.map((l) => l._id);

    const attendanceAgg = await LabourAttendance.aggregate([
      { $match: { labour: { $in: labourIds } } },
      { $group: { _id: '$labour', totalEarned: { $sum: '$dailyEarned' }, presentDays: { $sum: 1 } } },
    ]);

    const paymentAgg = await LabourPayment.aggregate([
      { $match: { labour: { $in: labourIds } } },
      { $group: { _id: '$labour', totalPaid: { $sum: '$amount' } } },
    ]);

    const attMap = {};
    attendanceAgg.forEach((a) => (attMap[a._id.toString()] = a));

    const payMap = {};
    paymentAgg.forEach((p) => (payMap[p._id.toString()] = p.totalPaid));

    const labourersWithFinancials = labourers.map((l) => {
      const id = l._id.toString();
      const att = attMap[id] || { totalEarned: 0, presentDays: 0 };
      const totalEarned = att.totalEarned;
      const totalPaid = payMap[id] || 0;
      const pending = Math.max(0, totalEarned - totalPaid);

      return {
        ...l,
        totalEarned,
        totalPaid,
        pending,
        presentDays: att.presentDays,
      };
    });

    res.json({ success: true, count: labourersWithFinancials.length, labourers: labourersWithFinancials });
  } catch (error) {
    next(error);
  }
};

exports.getLabourById = async (req, res, next) => {
  try {
    const labour = await Labour.findById(req.params.id);
    if (!labour) return res.status(404).json({ success: false, message: 'Labourer not found' });

    const attendance = await LabourAttendance.find({ labour: labour._id }).sort({ date: -1 });
    const payments = await LabourPayment.find({ labour: labour._id }).populate('season', 'name').sort({ date: -1 });

    const totalEarned = attendance.reduce((sum, a) => sum + (a.dailyEarned || 0), 0);
    const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const pending = totalEarned - totalPaid;

    res.json({
      success: true,
      labour,
      financials: { totalEarned, totalPaid, pending },
      attendance,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

exports.createLabour = async (req, res, next) => {
  try {
    const { name, mobile, address, dailyWage, joiningDate, notes } = req.body;
    const labour = await Labour.create({
      name,
      mobile,
      address,
      dailyWage: parseFloat(dailyWage) || 500,
      joiningDate,
      notes,
    });
    res.status(201).json({ success: true, labour });
  } catch (error) {
    next(error);
  }
};

exports.markLabourAttendance = async (req, res, next) => {
  try {
    const { labourId, date, status, notes } = req.body;

    const labour = await Labour.findById(labourId);
    if (!labour) return res.status(404).json({ success: false, message: 'Labourer not found' });

    let dailyEarned = 0;
    if (status === 'Present') dailyEarned = labour.dailyWage;
    else if (status === 'Half Day') dailyEarned = Math.round(labour.dailyWage / 2);

    const attendance = await LabourAttendance.findOneAndUpdate(
      { labour: labourId, date: new Date(date) },
      {
        labour: labourId,
        date: new Date(date),
        status,
        dailyEarned,
        notes,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, attendance });
  } catch (error) {
    next(error);
  }
};

exports.createLabourPayment = async (req, res, next) => {
  try {
    const { labourId, date, amount, paymentMethod, season, notes } = req.body;
    const pAmount = parseFloat(amount) || 0;

    const labourPayment = await LabourPayment.create({
      labour: labourId,
      date: date || new Date(),
      amount: pAmount,
      paymentMethod: paymentMethod || 'Cash',
      season,
      notes,
    });

    if (season) {
      const labour = await Labour.findById(labourId);
      await Expense.create({
        category: 'Labour',
        date: date || new Date(),
        season,
        amount: pAmount,
        description: `Labour Wage Paid: ${labour ? labour.name : 'Labour'} (${paymentMethod})`,
        notes: `Labour Payment ID: ${labourPayment._id}`,
      });
    }

    res.status(201).json({ success: true, labourPayment });
  } catch (error) {
    next(error);
  }
};
