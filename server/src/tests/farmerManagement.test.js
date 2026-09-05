const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcryptjs');
const assert = require('assert');

const User = require('../models/User');
const Customer = require('../models/Customer');
const Field = require('../models/Field');
const WorkEntry = require('../models/WorkEntry');
const Payment = require('../models/Payment');

const authRoutes = require('../routes/authRoutes');
const customerRoutes = require('../routes/customerRoutes');
const errorHandler = require('../middleware/errorHandler');

async function runFarmerTests() {
  console.log('====================================================');
  console.log(' RUNNING KRISHIKHATA FARMER MANAGEMENT VERIFICATION TEST');
  console.log('====================================================\n');

  let server;
  let port;
  let baseUrl;

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/khetkhata_test';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log(`Connected to MongoDB for testing: ${mongoUri}`);

    // Clear collections for clean test environment
    await Promise.all([
      User.deleteMany({}),
      Customer.deleteMany({}),
      Field.deleteMany({}),
      WorkEntry.deleteMany({}),
      Payment.deleteMany({}),
    ]);

    const app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use('/api/customers', customerRoutes);
    app.use(errorHandler);

    await new Promise((resolve) => {
      server = app.listen(0, () => {
        port = server.address().port;
        baseUrl = `http://localhost:${port}/api`;
        console.log(`Test Express Server listening on port ${port}`);
        resolve();
      });
    });

    // ----------------------------------------------------
    // Setup Users & Login Tokens (Admin & Operator)
    // ----------------------------------------------------
    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash('password123', salt);

    const admin = await User.create({
      name: 'Admin Owner',
      mobile: '9876543210',
      password: passHash,
      role: 'admin',
    });

    const operator = await User.create({
      name: 'Operator Staff',
      mobile: '9876543211',
      password: passHash,
      role: 'operator',
    });

    // Admin Login
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: '9876543210', password: 'password123' }),
    });
    const adminToken = (await adminLoginRes.json()).token;

    // Operator Login
    const opLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: '9876543211', password: 'password123' }),
    });
    const operatorToken = (await opLoginRes.json()).token;

    // ----------------------------------------------------
    // Test 1: Admin can add a new Farmer
    // ----------------------------------------------------
    console.log('\n[Test 1] Admin adding a new Farmer...');
    const addFarmer1Res = await fetch(`${baseUrl}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Ram Kumar',
        mobile: '9988776655',
        village: 'Rampur',
        address: 'Near Temple',
        notes: 'Land owner',
      }),
    });
    const addFarmer1Data = await addFarmer1Res.json();
    assert.strictEqual(addFarmer1Res.status, 201);
    assert.strictEqual(addFarmer1Data.success, true);
    assert.strictEqual(addFarmer1Data.customer.name, 'Ram Kumar');
    const farmer1Id = addFarmer1Data.customer._id;
    console.log('✅ PASS: Admin added Farmer "Ram Kumar".');

    // ----------------------------------------------------
    // Test 2: Operator can add a new Farmer
    // ----------------------------------------------------
    console.log('\n[Test 2] Operator adding a new Farmer...');
    const addFarmer2Res = await fetch(`${baseUrl}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${operatorToken}`,
      },
      body: JSON.stringify({
        name: 'Shyam Yadav',
        mobile: '9988776644',
        village: 'Lakshmipur',
      }),
    });
    const addFarmer2Data = await addFarmer2Res.json();
    assert.strictEqual(addFarmer2Res.status, 201);
    assert.strictEqual(addFarmer2Data.success, true);
    assert.strictEqual(addFarmer2Data.customer.name, 'Shyam Yadav');
    const farmer2Id = addFarmer2Data.customer._id;
    console.log('✅ PASS: Operator added Farmer "Shyam Yadav".');

    // ----------------------------------------------------
    // Test 3: Duplicate Mobile Number Check
    // ----------------------------------------------------
    console.log('\n[Test 3] Attempting to add farmer with duplicate mobile number...');
    const dupRes = await fetch(`${baseUrl}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${operatorToken}`,
      },
      body: JSON.stringify({
        name: 'Duplicate Ram',
        mobile: '9988776655', // Duplicate mobile
        village: 'Rampur',
      }),
    });
    const dupData = await dupRes.json();
    assert.strictEqual(dupRes.status, 400);
    assert.strictEqual(dupData.success, false);
    assert.strictEqual(dupData.message, 'This mobile number is already registered.');
    assert.ok(dupData.existingCustomer);
    console.log('✅ PASS: Duplicate mobile prevented and returned existing farmer object.');

    // ----------------------------------------------------
    // Test 4: Edit Farmer by Operator
    // ----------------------------------------------------
    console.log('\n[Test 4] Operator editing Farmer details...');
    const editRes = await fetch(`${baseUrl}/customers/${farmer1Id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${operatorToken}`,
      },
      body: JSON.stringify({
        name: 'Ram Kumar (Updated)',
        village: 'Rampur North',
      }),
    });
    const editData = await editRes.json();
    assert.strictEqual(editRes.status, 200);
    assert.strictEqual(editData.customer.name, 'Ram Kumar (Updated)');
    assert.strictEqual(editData.customer.village, 'Rampur North');
    console.log('✅ PASS: Operator successfully updated farmer details.');

    // ----------------------------------------------------
    // Test 5: Search Farmer by Name, Mobile, Village
    // ----------------------------------------------------
    console.log('\n[Test 5] Searching Farmer by village "Lakshmipur"...');
    const searchRes = await fetch(`${baseUrl}/customers?search=Lakshmipur`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${operatorToken}` },
    });
    const searchData = await searchRes.json();
    assert.strictEqual(searchRes.status, 200);
    assert.strictEqual(searchData.customers.length, 1);
    assert.strictEqual(searchData.customers[0].name, 'Shyam Yadav');
    console.log('✅ PASS: Search returned correct farmer.');

    // ----------------------------------------------------
    // Test 6: Hard Delete Farmer WITHOUT Linked Records
    // ----------------------------------------------------
    console.log('\n[Test 6] Deleting Farmer WITHOUT linked records...');
    const deleteUnlinkedRes = await fetch(`${baseUrl}/customers/${farmer2Id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${operatorToken}` },
    });
    const deleteUnlinkedData = await deleteUnlinkedRes.json();
    assert.strictEqual(deleteUnlinkedRes.status, 200);
    assert.strictEqual(deleteUnlinkedData.success, true);
    assert.strictEqual(deleteUnlinkedData.message, 'Farmer deleted successfully.');
    console.log('✅ PASS: Unlinked farmer permanently deleted.');

    // ----------------------------------------------------
    // Test 7: Hard Delete Farmer WITH Linked Records (Should Fail with 409)
    // ----------------------------------------------------
    console.log('\n[Test 7] Creating payment record for Ram Kumar and attempting deletion...');
    await Payment.create({
      customer: farmer1Id,
      amount: 2000,
      paymentMethod: 'Cash',
      date: new Date(),
    });

    const deleteLinkedRes = await fetch(`${baseUrl}/customers/${farmer1Id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${operatorToken}` },
    });
    const deleteLinkedData = await deleteLinkedRes.json();
    assert.strictEqual(deleteLinkedRes.status, 409);
    assert.strictEqual(deleteLinkedData.success, false);
    assert.strictEqual(deleteLinkedData.hasLinkedRecords, true);
    console.log('✅ PASS: Backend blocked deleting farmer with existing financial records (409 Conflict).');

    // ----------------------------------------------------
    // Test 8: Deactivating Farmer WITH Linked Records
    // ----------------------------------------------------
    console.log('\n[Test 8] Deactivating Farmer WITH linked records...');
    const deactivateRes = await fetch(`${baseUrl}/customers/${farmer1Id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${operatorToken}`,
      },
      body: JSON.stringify({ status: 'Inactive' }),
    });
    const deactivateData = await deactivateRes.json();
    assert.strictEqual(deactivateRes.status, 200);
    assert.strictEqual(deactivateData.customer.status, 'Inactive');
    console.log('✅ PASS: Farmer status successfully changed to "Inactive".');

    // ----------------------------------------------------
    // Test 9: Verify Historical Financial Data Remains Intact
    // ----------------------------------------------------
    console.log('\n[Test 9] Verifying historical financial ledger for deactivated farmer...');
    const detailsRes = await fetch(`${baseUrl}/customers/${farmer1Id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${operatorToken}` },
    });
    const detailsData = await detailsRes.json();
    assert.strictEqual(detailsRes.status, 200);
    assert.strictEqual(detailsData.customer.status, 'Inactive');
    assert.strictEqual(detailsData.financials.totalPaid, 2000);
    assert.strictEqual(detailsData.payments.length, 1);
    console.log('✅ PASS: Historical ledger and financial totals completely preserved.');

    console.log('\n====================================================');
    console.log(' 🎉 ALL FARMER MANAGEMENT VERIFICATION TESTS PASSED!');
    console.log('====================================================\n');
  } catch (error) {
    console.error('\n❌ TEST FAILURE:', error);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  }
}

runFarmerTests();
