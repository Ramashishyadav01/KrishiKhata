const Field = require('../models/Field');

exports.getFields = async (req, res, next) => {
  try {
    const { customer } = req.query;
    let query = {};
    if (customer) query.customer = customer;

    const fields = await Field.find(query).populate('customer', 'name mobile village').sort({ createdAt: -1 });
    res.json({ success: true, count: fields.length, fields });
  } catch (error) {
    next(error);
  }
};

exports.createField = async (req, res, next) => {
  try {
    const { customer, name, village, bigha, bissa, notes } = req.body;
    const field = await Field.create({ customer, name, village, bigha, bissa, notes });
    const populated = await Field.findById(field._id).populate('customer', 'name mobile village');
    res.status(201).json({ success: true, field: populated });
  } catch (error) {
    next(error);
  }
};

exports.updateField = async (req, res, next) => {
  try {
    const { name, village, bigha, bissa, notes } = req.body;
    const totalBissa = (parseFloat(bigha) || 0) * 20 + (parseFloat(bissa) || 0);
    const field = await Field.findByIdAndUpdate(
      req.params.id,
      { name, village, bigha, bissa, totalBissa, notes },
      { new: true, runValidators: true }
    ).populate('customer', 'name mobile village');

    if (!field) return res.status(404).json({ success: false, message: 'Field not found' });
    res.json({ success: true, field });
  } catch (error) {
    next(error);
  }
};

exports.deleteField = async (req, res, next) => {
  try {
    await Field.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Field deleted successfully' });
  } catch (error) {
    next(error);
  }
};
