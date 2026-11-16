const mongoose = require('mongoose');

const SeasonSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. Kharif 2026, Rabi 2026-27
    startDate: { type: Date, default: Date.now },
    endDate: {
      type: Date,
      default: () => new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    },
    status: { type: String, enum: ['Active', 'Completed'], default: 'Active' },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Season', SeasonSchema);
