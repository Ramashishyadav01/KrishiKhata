const mongoose = require('mongoose');

const DriverAttendanceSchema = new mongoose.Schema(
  {
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['Present', 'Absent', 'Half Day'], default: 'Present' },
    machine: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine' },
    workPerformed: { type: String, trim: true },
    workingHours: { type: Number, default: 8 },
    dailyEarned: { type: Number, default: 0 },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

DriverAttendanceSchema.index({ driver: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DriverAttendance', DriverAttendanceSchema);
