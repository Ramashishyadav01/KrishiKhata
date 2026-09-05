const mongoose = require('mongoose');

const RiceMillEntrySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, default: Date.now },
    season: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String, trim: true }, // Optional walk-in customer name
    
    riceProcessedQuintal: { type: Number, required: true, min: 0 },
    branProducedQuintal: { type: Number, required: true, min: 0 },
    processingRatePerQuintal: { type: Number, default: 0 },
    totalProcessingCharge: { type: Number, default: 0 },
    
    electricityCost: { type: Number, default: 0 },
    labourCost: { type: Number, default: 0 },
    otherCosts: { type: Number, default: 0 },
    
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RiceMillEntry', RiceMillEntrySchema);
