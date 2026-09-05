const Payment = require('../models/Payment');
const WorkEntry = require('../models/WorkEntry');

exports.getPayments = async (req, res, next) => {
  try {
    const { customer, season, paymentMethod, startDate, endDate } = req.query;
    let query = { isDeleted: { $ne: true } };

    if (customer) query.customer = customer;
    if (season) query.season = season;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const payments = await Payment.find(query)
      .populate('customer', 'name mobile village')
      .populate('workEntry')
      .populate('season', 'name')
      .sort({ date: -1 });

    res.json({ success: true, count: payments.length, payments });
  } catch (error) {
    next(error);
  }
};

exports.createPayment = async (req, res, next) => {
  try {
    const { customer, workEntry, date, amount, paymentMethod, reference, season, notes } = req.body;
    const pAmount = parseFloat(amount) || 0;

    const payment = await Payment.create({
      customer,
      workEntry: workEntry || null,
      date: date || new Date(),
      amount: pAmount,
      paymentMethod: paymentMethod || 'Cash',
      reference,
      season,
      notes,
    });

    // If payment is explicitly linked to a work entry, recalculate work entry payment status
    if (workEntry) {
      const allPayments = await Payment.find({ workEntry, isDeleted: { $ne: true } });
      const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

      const targetWork = await WorkEntry.findById(workEntry);
      if (targetWork) {
        let status = 'PENDING';
        if (totalPaid >= targetWork.totalAmount && targetWork.totalAmount > 0) {
          status = 'PAID';
        } else if (totalPaid > 0) {
          status = 'PARTIAL';
        }
        await WorkEntry.findByIdAndUpdate(workEntry, { paidAmount: totalPaid, paymentStatus: status });
      }
    }

    const populated = await Payment.findById(payment._id).populate('customer workEntry season');
    res.status(201).json({ success: true, payment: populated });
  } catch (error) {
    next(error);
  }
};

exports.deletePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    if (payment.workEntry) {
      const allPayments = await Payment.find({ workEntry: payment.workEntry, isDeleted: { $ne: true } });
      const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
      const targetWork = await WorkEntry.findById(payment.workEntry);
      if (targetWork) {
        let status = 'PENDING';
        if (totalPaid >= targetWork.totalAmount && targetWork.totalAmount > 0) {
          status = 'PAID';
        } else if (totalPaid > 0) {
          status = 'PARTIAL';
        }
        await WorkEntry.findByIdAndUpdate(payment.workEntry, { paidAmount: totalPaid, paymentStatus: status });
      }
    }

    res.json({ success: true, message: 'Payment deleted', payment });
  } catch (error) {
    next(error);
  }
};
