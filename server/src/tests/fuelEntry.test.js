const mongoose = require('mongoose');
const express = require('express');
const jwt = require('jsonwebtoken');
const assert = require('assert');

const FuelEntry = require('../models/FuelEntry');
const Expense = require('../models/Expense');
const Machine = require('../models/Machine');
const Season = require('../models/Season');
const User = require('../models/User');

const fuelRoutes = require('../routes/fuelRoutes');
const errorHandler = require('../middleware/errorHandler');

async function runFuelTests() {
  console.log('====================================================');
  console.log(' RUNNING KRISHIKHATA FUEL ENTRY VERIFICATION TEST');
  console.log('====================================================\n');

  let server;
  let port;

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/khetkhata_test';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log(`Connected to MongoDB for testing: ${mongoUri}`);

    const app = express();
    app.use(express.json());
    app.use('/api/fuel-entries', fuelRoutes);
    app.use(errorHandler);

    await new Promise((resolve) => {
      server = app.listen(0, () => {
        port = server.address().port;
        console.log(`Test Express Server listening on port ${port}`);
        resolve();
      });
    });

    const user = await User.findOne({ role: 'operator' }) || await User.findOne() || await User.create({
      name: 'Test Operator',
      mobile: '9876543211',
      password: 'password123',
      role: 'operator',
    });

    const token = jwt.sign({ id: user._id, userId: user._id, role: user.role }, process.env.JWT_SECRET || 'khetkhata_super_secret_jwt_key_2026_farm_management');

    let machine = await Machine.findOne({ nameEn: 'Tractor' });
    if (!machine) {
      machine = await Machine.create({
        nameEn: 'Tractor',
        nameHi: 'ट्रैक्टर',
        billingUnit: 'Hour',
        defaultRate: 1000,
      });
    }

    let activeSeason = await Season.findOne({ status: 'Active' });
    if (!activeSeason) {
      activeSeason = await Season.create({
        name: 'Kharif 2026',
        startDate: new Date('2026-06-01'),
        endDate: new Date('2026-10-31'),
        status: 'Active',
      });
    }

    // ----------------------------------------------------
    // Test 1: Log Fuel Entry with 55L @ 92/L for Tractor (Vendor: Ghosi, empty season)
    // ----------------------------------------------------
    console.log('[Test 1] Logging fuel entry (Tractor, 55L, ₹92/L, Vendor: Ghosi, empty season)...');
    const res = await fetch(`http://localhost:${port}/api/fuel-entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        date: '2026-09-04',
        machine: machine._id,
        fuelType: 'Diesel',
        quantity: 55,
        ratePerLitre: 92,
        vendor: 'Ghosi',
        season: '',
      }),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.fuelEntry.quantity, 55);
    assert.strictEqual(data.fuelEntry.ratePerLitre, 92);
    assert.strictEqual(data.fuelEntry.totalAmount, 5060); // 55 * 92 = 5060
    assert.strictEqual(data.fuelEntry.vendor, 'Ghosi');
    assert.strictEqual(data.fuelEntry.season._id.toString(), activeSeason._id.toString());
    console.log('✅ PASS: Fuel entry created. Total calculated cost: ₹5,060.');

    // ----------------------------------------------------
    // Test 2: Verify linked Expense creation in MongoDB
    // ----------------------------------------------------
    console.log('\n[Test 2] Verifying auto-created linked Expense record...');
    const linkedExpense = await Expense.findOne({ notes: `Linked Fuel Entry ID: ${data.fuelEntry._id}` });
    assert.ok(linkedExpense);
    assert.strictEqual(linkedExpense.amount, 5060);
    assert.strictEqual(linkedExpense.category, 'Diesel');
    assert.strictEqual(linkedExpense.vendor, 'Ghosi');
    console.log('✅ PASS: Linked Expense auto-logged for unified expense reporting.');

    // ----------------------------------------------------
    // Test 3: Validation checks for invalid inputs
    // ----------------------------------------------------
    console.log('\n[Test 3] Validation for quantity <= 0...');
    const resBadQty = await fetch(`http://localhost:${port}/api/fuel-entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ machine: machine._id, quantity: 0, ratePerLitre: 92 }),
    });
    assert.strictEqual(resBadQty.status, 400);
    const badQtyData = await resBadQty.json();
    assert.strictEqual(badQtyData.success, false);
    console.log(`✅ PASS: Invalid quantity rejected with: "${badQtyData.message}"`);

    console.log('\n====================================================');
    console.log(' 🎉 ALL FUEL ENTRY VERIFICATION TESTS PASSED PERFECTLY!');
    console.log('====================================================\n');
  } catch (error) {
    console.error('\n❌ TEST FAILURE:', error);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  }
}

runFuelTests();
