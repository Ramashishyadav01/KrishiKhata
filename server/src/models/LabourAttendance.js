const mongoose = require('mongoose');

const LabourAttendanceSchema = new mongoose.Schema(
  {
    labour: { type: mongoose.Schema.Types.ObjectId, ref: 'Labour', required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['Present', 'Absent', 'Half Day'], default: 'Present' },
    dailyEarned: { type: Number, default: 0 },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

LabourAttendanceSchema.index({ labour: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('LabourAttendance', LabourAttendanceSchema);
