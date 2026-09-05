const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    workEntry: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkEntry' },
    date: { type: Date, required: true, default: Date.now },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['Cash', 'UPI', 'Bank Transfer', 'Other'], default: 'Cash' },
    reference: { type: String, trim: true },
    season: { type: mongoose.Schema.Types.ObjectId, ref: 'Season' },
    notes: { type: String, trim: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', PaymentSchema);
