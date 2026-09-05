const mongoose = require('mongoose');

const FieldSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    name: { type: String, required: true, trim: true }, // Field 1, North Field, etc.
    village: { type: String, required: true, trim: true },
    bigha: { type: Number, default: 0 },
    bissa: { type: Number, default: 0 },
    totalBissa: { type: Number, default: 0 }, // 1 Bigha = 20 Bissa
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

FieldSchema.pre('save', function (next) {
  this.totalBissa = (this.bigha || 0) * 20 + (this.bissa || 0);
  next();
});

module.exports = mongoose.model('Field', FieldSchema);
