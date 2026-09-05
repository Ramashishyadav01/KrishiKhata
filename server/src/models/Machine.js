const mongoose = require('mongoose');

const MachineSchema = new mongoose.Schema(
  {
    nameEn: { type: String, required: true, trim: true },
    nameHi: { type: String, required: true, trim: true },
    billingUnit: {
      type: String,
      enum: ['Bigha', 'Hour', 'Trip', 'Quintal', 'Custom'],
      required: true,
    },
    defaultRate: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ['Active', 'Maintenance', 'Inactive'], default: 'Active' },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Machine', MachineSchema);
