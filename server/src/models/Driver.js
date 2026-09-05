const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    joiningDate: { type: Date, default: Date.now },
    salaryType: { type: String, enum: ['Daily', 'Monthly'], default: 'Daily' },
    dailyRate: { type: Number, default: 0 },
    monthlySalary: { type: Number, default: 0 },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Driver', DriverSchema);
