const mongoose = require('mongoose');
const express = require('express');
const jwt = require('jsonwebtoken');
const assert = require('assert');

const BranSale = require('../models/BranSale');
const Customer = require('../models/Customer');
const Season = require('../models/Season');
const User = require('../models/User');

const branSaleRoutes = require('../routes/branSaleRoutes');
const customerRoutes = require('../routes/customerRoutes');
const errorHandler = require('../middleware/errorHandler');

async function runBranSaleTests() {
  console.log('====================================================');
  console.log(' RUNNING KRISHIKHATA BRAN SALE VERIFICATION TEST');
  console.log('====================================================\n');

  let server;
  let port;

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/khetkhata_test';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log(`Connected to MongoDB for testing: ${mongoUri}`);

    await BranSale.deleteMany({});
    await Customer.deleteMany({});
    await Season.deleteMany({});

    const app = express();
    app.use(express.json());
    app.use('/api/bran-sales', branSaleRoutes);
    app.use('/api/customers', customerRoutes);
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

    let activeSeason = await Season.findOne({ status: 'Active' });
    if (!activeSeason) {
      activeSeason = await Season.create({
        name: 'Kharif 2026',
        startDate: new Date('2026-06-01'),
        endDate: new Date('2026-10-31'),
        status: 'Active',
      });
    }

    let customer = await Customer.findOne({ name: 'Dinesh Singh' });
    if (!customer) {
      customer = await Customer.create({
        name: 'Dinesh Singh',
        mobile: '9988776633',
        village: 'Rampur',
      });
    }

    // ----------------------------------------------------
    // Test 1: Log Bran Sale (55 Qtl @ ₹1200 = ₹66,000, Received = ₹12,000, Due = ₹54,000)
    // ----------------------------------------------------
    console.log('[Test 1] Logging Bran Sale for Dinesh Singh (55 Qtl @ ₹1200, Received ₹12,000)...');
    const res = await fetch(`http://localhost:${port}/api/bran-sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        date: '2026-09-04',
        customer: customer._id,
        buyer: 'Dinesh Singh',
        buyerMobile: '9988776633',
        quantityQuintal: 55,
        ratePerQuintal: 1200,
        amountReceived: 12000,
        paymentMethod: 'Cash',
        season: '',
      }),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.branSale.quantityQuintal, 55);
    assert.strictEqual(data.branSale.ratePerQuintal, 1200);
    assert.strictEqual(data.branSale.totalSaleAmount, 66000); // 55 * 1200 = 66000
    assert.strictEqual(data.branSale.amountReceived, 12000);
    assert.strictEqual(data.branSale.pendingAmount, 54000); // 66000 - 12000 = 54000
    assert.strictEqual(data.branSale.season._id.toString(), activeSeason._id.toString());
    console.log('✅ PASS: Bran Sale created. Total: ₹66,000, Received: ₹12,000, Pending Due: ₹54,000.');

    // ----------------------------------------------------
    // Test 2: Verify Farmer Ledger & Financial Balance
    // ----------------------------------------------------
    console.log('\n[Test 2] Verifying Dinesh Singh Customer Ledger & Balance...');
    const resCust = await fetch(`http://localhost:${port}/api/customers/${customer._id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    assert.strictEqual(resCust.status, 200);
    const custData = await resCust.json();
    assert.strictEqual(custData.financials.totalWork, 66000);
    assert.strictEqual(custData.financials.totalPaid, 12000);
    assert.strictEqual(custData.financials.pending, 54000);
    assert.ok(custData.ledger.some((l) => l.type === 'BRAN_SALE' && l.debit === 66000 && l.credit === 12000));
    console.log('✅ PASS: Customer ledger updated with Debit: ₹66,000, Credit: ₹12,000, Net Due: ₹54,000.');

    // ----------------------------------------------------
    // Test 3: Rejection when Amount Received > Total Amount
    // ----------------------------------------------------
    console.log('\n[Test 3] Validation for Received Amount > Total Amount...');
    const resExceed = await fetch(`http://localhost:${port}/api/bran-sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        customer: customer._id,
        buyer: 'Dinesh Singh',
        quantityQuintal: 10,
        ratePerQuintal: 1000, // Total = 10,000
        amountReceived: 15000, // Received > Total
      }),
    });

    assert.strictEqual(resExceed.status, 400);
    const exceedData = await resExceed.json();
    assert.strictEqual(exceedData.success, false);
    console.log(`✅ PASS: Excess received amount rejected with: "${exceedData.message}"`);

    console.log('\n====================================================');
    console.log(' 🎉 ALL BRAN SALE VERIFICATION TESTS PASSED PERFECTLY!');
    console.log('====================================================\n');
  } catch (error) {
    console.error('\n❌ TEST FAILURE:', error);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  }
}

runBranSaleTests();
