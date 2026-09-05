const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: [
        'Diesel',
        'Petrol',
        'Electricity',
        'Repair',
        'Spare Parts',
        'Labour',
        'Driver',
        'Transport',
        'Maintenance',
        'Other',
      ],
      required: true,
    },
    date: { type: Date, required: true, default: Date.now },
    season: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', required: true },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true },
    paymentMethod: { type: String, enum: ['Cash', 'UPI', 'Bank Transfer', 'Other'], default: 'Cash' },
    vendor: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', ExpenseSchema);
