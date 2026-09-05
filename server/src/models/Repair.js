const mongoose = require('mongoose');

const RepairSchema = new mongoose.Schema(
  {
    machine: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
    date: { type: Date, required: true, default: Date.now },
    season: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', required: true },
    problem: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    partsCost: { type: Number, default: 0 },
    labourCost: { type: Number, default: 0 },
    totalCost: { type: Number, required: true },
    mechanic: { type: String, trim: true },
    status: { type: String, enum: ['Pending', 'Completed'], default: 'Completed' },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Repair', RepairSchema);
