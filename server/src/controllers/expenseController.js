const Expense = require('../models/Expense');

exports.getExpenses = async (req, res, next) => {
  try {
    const { category, season, startDate, endDate } = req.query;
    let query = {};
    if (category) query.category = category;
    if (season) query.season = season;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query).populate('season', 'name').sort({ date: -1 });

    const totalExpense = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    // Group by category
    const categoryTotals = {};
    expenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    res.json({
      success: true,
      count: expenses.length,
      summary: { totalExpense, categoryTotals },
      expenses,
    });
  } catch (error) {
    next(error);
  }
};

exports.createExpense = async (req, res, next) => {
  try {
    const { category, date, season, amount, description, paymentMethod, vendor, notes } = req.body;
    const expense = await Expense.create({
      category,
      date: date || new Date(),
      season,
      amount: parseFloat(amount) || 0,
      description,
      paymentMethod: paymentMethod || 'Cash',
      vendor,
      notes,
    });

    const populated = await Expense.findById(expense._id).populate('season');
    res.status(201).json({ success: true, expense: populated });
  } catch (error) {
    next(error);
  }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    next(error);
  }
};
