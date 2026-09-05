const mongoose = require('mongoose');

const WorkEntrySchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    field: { type: mongoose.Schema.Types.ObjectId, ref: 'Field' },
    village: { type: String, trim: true },
    date: { type: Date, required: true, default: Date.now },
    season: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', required: true },
    machine: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
    billingUnit: { type: String, enum: ['Bigha', 'Hour', 'Trip', 'Quintal', 'Custom'], required: true },
    
    // Dynamic quantitative metrics based on machine billing unit
    bigha: { type: Number, default: 0 },
    bissa: { type: Number, default: 0 },
    totalBissa: { type: Number, default: 0 }, // internal calculation: bigha * 20 + bissa
    hours: { type: Number, default: 0 },
    trips: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },
    
    // Pricing
    rate: { type: Number, required: true }, // Snapshotted rate at work creation
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ['PAID', 'PARTIAL', 'PENDING'], default: 'PENDING' },
    
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    description: { type: String, trim: true },
    notes: { type: String, trim: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WorkEntry', WorkEntrySchema);
