const mongoose = require('mongoose');
const express = require('express');
const jwt = require('jsonwebtoken');
const assert = require('assert');

const Machine = require('../models/Machine');
const User = require('../models/User');
const machineRoutes = require('../routes/machineRoutes');
const errorHandler = require('../middleware/errorHandler');

async function runMachineRateTests() {
  console.log('====================================================');
  console.log(' RUNNING KRISHIKHATA MACHINE RATE UPDATE TEST');
  console.log('====================================================\n');

  let server;
  let port;

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/khetkhata_test';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log(`Connected to MongoDB for testing: ${mongoUri}`);

    const app = express();
    app.use(express.json());
    app.use('/api/machines', machineRoutes);
    app.use(errorHandler);

    await new Promise((resolve) => {
      server = app.listen(0, () => {
        port = server.address().port;
        console.log(`Test Express Server listening on port ${port}`);
        resolve();
      });
    });

    const admin = await User.findOne({ role: 'admin' }) || await User.create({
      name: 'Test Admin',
      mobile: '9900000001',
      password: 'password123',
      role: 'admin',
    });

    const operator = await User.findOne({ role: 'operator' }) || await User.create({
      name: 'Test Operator',
      mobile: '9900000002',
      password: 'password123',
      role: 'operator',
    });

    const adminToken = jwt.sign({ id: admin._id, userId: admin._id, role: admin.role }, process.env.JWT_SECRET || 'khetkhata_super_secret_jwt_key_2026_farm_management');
    const operatorToken = jwt.sign({ id: operator._id, userId: operator._id, role: operator.role }, process.env.JWT_SECRET || 'khetkhata_super_secret_jwt_key_2026_farm_management');

    const serviceList = [
      { nameEn: 'Tractor', nameHi: 'ट्रैक्टर', billingUnit: 'Hour', defaultRate: 1000 },
      { nameEn: 'Trolley', nameHi: 'ट्रॉली', billingUnit: 'Trip', defaultRate: 800 },
      { nameEn: 'Rotavator', nameHi: 'रोटावेटर', billingUnit: 'Bigha', defaultRate: 2000 },
      { nameEn: '9 Harrah', nameHi: '9 हर्रा', billingUnit: 'Bigha', defaultRate: 1500 },
      { nameEn: 'TY', nameHi: 'टी.वाई.', billingUnit: 'Bigha', defaultRate: 1600 },
      { nameEn: 'Dhan Thresher', nameHi: 'धान थ्रेशर', billingUnit: 'Hour', defaultRate: 1200 },
      { nameEn: 'Gehu Thresher', nameHi: 'गेहूं थ्रेशर', billingUnit: 'Hour', defaultRate: 1100 },
      { nameEn: 'Palewa', nameHi: 'पलेवा', billingUnit: 'Hour', defaultRate: 800 },
      { nameEn: 'Rice Mill', nameHi: 'राइस मिल', billingUnit: 'Quintal', defaultRate: 250 },
      { nameEn: 'Bran', nameHi: 'चोकर', billingUnit: 'Quintal', defaultRate: 2500 },
    ];

    for (const service of serviceList) {
      let doc = await Machine.findOne({ nameEn: service.nameEn });
      if (!doc) {
        doc = await Machine.create(service);
      }

      console.log(`[Test] Updating rate for ${service.nameEn} as Operator...`);
      const newRate = service.defaultRate + 200;

      const res = await fetch(`http://localhost:${port}/api/machines/${doc._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${operatorToken}`,
        },
        body: JSON.stringify({ defaultRate: newRate }),
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.machine.defaultRate, newRate);

      // Verify in DB
      const updatedDoc = await Machine.findById(doc._id);
      assert.strictEqual(updatedDoc.defaultRate, newRate);
      console.log(`  ✅ PASS: ${service.nameEn} default rate updated to ₹${updatedDoc.defaultRate}/${updatedDoc.billingUnit}`);
    }

    console.log('\n[Test] Testing negative rate input validation (400 Bad Request)...');
    const firstDoc = await Machine.findOne();
    const badRes = await fetch(`http://localhost:${port}/api/machines/${firstDoc._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${operatorToken}`,
      },
      body: JSON.stringify({ defaultRate: -50 }),
    });

    assert.strictEqual(badRes.status, 400);
    const badData = await badRes.json();
    assert.strictEqual(badData.success, false);
    console.log(`  ✅ PASS: Negative rate rejected with message: "${badData.message}"`);

    console.log('\n====================================================');
    console.log(' 🎉 ALL MACHINE RATE UPDATE TESTS PASSED PERFECTLY!');
    console.log('====================================================\n');
  } catch (error) {
    console.error('\n❌ TEST FAILURE:', error);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  }
}

runMachineRateTests();
