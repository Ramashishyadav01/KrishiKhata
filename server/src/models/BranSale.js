const mongoose = require('mongoose');

const BranSaleSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, default: Date.now },
    season: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    buyer: { type: String, required: true, trim: true },
    buyerMobile: { type: String, trim: true },
    quantityQuintal: { type: Number, required: true, min: 0 },
    ratePerQuintal: { type: Number, required: true, min: 0 },
    totalSaleAmount: { type: Number, required: true },
    amountReceived: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 },
    paymentMethod: { type: String, enum: ['Cash', 'UPI', 'Bank Transfer', 'Other'], default: 'Cash' },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

BranSaleSchema.pre('validate', function (next) {
  this.totalSaleAmount = Math.round((this.quantityQuintal || 0) * (this.ratePerQuintal || 0));
  this.pendingAmount = Math.max(0, this.totalSaleAmount - (this.amountReceived || 0));
  next();
});

module.exports = mongoose.model('BranSale', BranSaleSchema);
