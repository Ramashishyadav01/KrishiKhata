const mongoose = require('mongoose');

const FuelEntrySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, default: Date.now },
    season: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', required: true },
    machine: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
    fuelType: { type: String, enum: ['Diesel', 'Petrol', 'Other'], default: 'Diesel' },
    quantity: { type: Number, required: true }, // Litres
    ratePerLitre: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    meterReading: { type: String, trim: true },
    vendor: { type: String, trim: true }, // Petrol Pump Name
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FuelEntry', FuelEntrySchema);
