const WorkEntry = require('../models/WorkEntry');
const Payment = require('../models/Payment');
const Season = require('../models/Season');
const { resolveOrCreateSeason } = require('../utils/seasonHelper');
const mongoose = require('mongoose');
const { calculateAmount, calculateTotalBissa } = require('../utils/bighaMath');

exports.getWorkEntries = async (req, res, next) => {
  try {
    const { season, customer, machine, paymentStatus, startDate, endDate, search } = req.query;
    let query = { isDeleted: { $ne: true } };

    if (season) query.season = season;
    if (customer) query.customer = customer;
    if (machine) query.machine = machine;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const entries = await WorkEntry.find(query)
      .populate('customer', 'name mobile village')
      .populate('field', 'name village bigha bissa totalBissa')
      .populate('machine', 'nameEn nameHi billingUnit defaultRate')
      .populate('season', 'name status')
      .populate('driver', 'name mobile')
      .sort({ date: -1 });

    res.json({ success: true, count: entries.length, workEntries: entries });
  } catch (error) {
    next(error);
  }
};

exports.getWorkEntryById = async (req, res, next) => {
  try {
    const entry = await WorkEntry.findById(req.params.id)
      .populate('customer field machine season driver');
    if (!entry || entry.isDeleted) return res.status(404).json({ success: false, message: 'Work entry not found' });
    res.json({ success: true, workEntry: entry });
  } catch (error) {
    next(error);
  }
};

exports.createWorkEntry = async (req, res, next) => {
  try {
    let {
      customer,
      field,
      village,
      date,
      season,
      machine,
      billingUnit,
      bigha,
      bissa,
      hours,
      trips,
      quantity,
      rate,
      paidAmount,
      driver,
      description,
      notes,
    } = req.body;

    season = await resolveOrCreateSeason(season);

    const bg = parseFloat(bigha) || 0;
    const bs = parseFloat(bissa) || 0;
    const hrs = parseFloat(hours) || 0;
    const trps = parseFloat(trips) || 0;
    const qty = parseFloat(quantity) || 0;
    const rt = parseFloat(rate) || 0;
    const paid = parseFloat(paidAmount) || 0;

    const totalBissa = calculateTotalBissa(bg, bs);
    const calculatedTotal = calculateAmount(billingUnit, rt, {
      bigha: bg,
      bissa: bs,
      hours: hrs,
      trips: trps,
      quantity: qty,
    });

    let paymentStatus = 'PENDING';
    if (paid >= calculatedTotal && calculatedTotal > 0) {
      paymentStatus = 'PAID';
    } else if (paid > 0) {
      paymentStatus = 'PARTIAL';
    }

    const workEntry = await WorkEntry.create({
      customer,
      field: field || null,
      village,
      date: date || new Date(),
      season,
      machine,
      billingUnit,
      bigha: bg,
      bissa: bs,
      totalBissa,
      hours: hrs,
      trips: trps,
      quantity: qty,
      rate: rt,
      totalAmount: calculatedTotal,
      paidAmount: paid,
      paymentStatus,
      driver: driver || null,
      description,
      notes,
    });

    // If initial payment was made, automatically record payment log
    if (paid > 0) {
      await Payment.create({
        customer,
        workEntry: workEntry._id,
        date: date || new Date(),
        amount: paid,
        paymentMethod: 'Cash',
        season,
        notes: `Initial payment at work entry (${workEntry._id.toString().slice(-6)})`,
      });
    }

    const populated = await WorkEntry.findById(workEntry._id).populate('customer field machine season driver');
    res.status(201).json({ success: true, workEntry: populated });
  } catch (error) {
    next(error);
  }
};

exports.updateWorkEntry = async (req, res, next) => {
  try {
    const {
      customer,
      field,
      village,
      date,
      season,
      machine,
      billingUnit,
      bigha,
      bissa,
      hours,
      trips,
      quantity,
      rate,
      driver,
      description,
      notes,
    } = req.body;

    const bg = parseFloat(bigha) || 0;
    const bs = parseFloat(bissa) || 0;
    const hrs = parseFloat(hours) || 0;
    const trps = parseFloat(trips) || 0;
    const qty = parseFloat(quantity) || 0;
    const rt = parseFloat(rate) || 0;

    const totalBissa = calculateTotalBissa(bg, bs);
    const calculatedTotal = calculateAmount(billingUnit, rt, {
      bigha: bg,
      bissa: bs,
      hours: hrs,
      trips: trps,
      quantity: qty,
    });

    const existingEntry = await WorkEntry.findById(req.params.id);
    if (!existingEntry || existingEntry.isDeleted) {
      return res.status(404).json({ success: false, message: 'Work entry not found' });
    }

    // Keep payments sum
    const payments = await Payment.find({ workEntry: req.params.id, isDeleted: { $ne: true } });
    const currentPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    let paymentStatus = 'PENDING';
    if (currentPaid >= calculatedTotal && calculatedTotal > 0) {
      paymentStatus = 'PAID';
    } else if (currentPaid > 0) {
      paymentStatus = 'PARTIAL';
    }

    const updated = await WorkEntry.findByIdAndUpdate(
      req.params.id,
      {
        customer,
        field: field || null,
        village,
        date,
        season,
        machine,
        billingUnit,
        bigha: bg,
        bissa: bs,
        totalBissa,
        hours: hrs,
        trips: trps,
        quantity: qty,
        rate: rt,
        totalAmount: calculatedTotal,
        paidAmount: currentPaid,
        paymentStatus,
        driver: driver || null,
        description,
        notes,
      },
      { new: true }
    ).populate('customer field machine season driver');

    res.json({ success: true, workEntry: updated });
  } catch (error) {
    next(error);
  }
};

exports.deleteWorkEntry = async (req, res, next) => {
  try {
    const entry = await WorkEntry.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!entry) return res.status(404).json({ success: false, message: 'Work entry not found' });
    res.json({ success: true, message: 'Work entry soft deleted', workEntry: entry });
  } catch (error) {
    next(error);
  }
};
