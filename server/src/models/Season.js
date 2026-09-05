const mongoose = require('mongoose');

const SeasonSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. Kharif 2026, Rabi 2026-27
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['Active', 'Completed'], default: 'Active' },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Season', SeasonSchema);
