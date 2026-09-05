const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcryptjs');
const assert = require('assert');

const User = require('../models/User');
const authRoutes = require('../routes/authRoutes');
const errorHandler = require('../middleware/errorHandler');

async function runTests() {
  console.log('====================================================');
  console.log(' RUNNING KRISHIKHATA SINGLE ADMIN RULE VERIFICATION TEST');
  console.log('====================================================\n');

  let server;
  let port;
  let baseUrl;

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/khetkhata_test';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log(`Connected to MongoDB for testing: ${mongoUri}`);

    // Clear users collection for a clean test run
    await User.deleteMany({});

    const app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use(errorHandler);

    await new Promise((resolve) => {
      server = app.listen(0, () => {
        port = server.address().port;
        baseUrl = `http://localhost:${port}/api/auth`;
        console.log(`Test Express Server listening on port ${port}`);
        resolve();
      });
    });

    // ----------------------------------------------------
    // Test 1: Seed Initial Admin Account
    // ----------------------------------------------------
    console.log('\n[Test 1] Initializing single Admin account...');
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const adminUser = await User.create({
      name: 'Farm Owner (Admin)',
      mobile: '9876543210',
      email: 'admin@krishikhata.com',
      password: adminPassword,
      role: 'admin',
    });
    assert.strictEqual(adminUser.role, 'admin');
    console.log('✅ PASS: Admin account created successfully.');

    // ----------------------------------------------------
    // Test 2: Admin Login
    // ----------------------------------------------------
    console.log('\n[Test 2] Admin login...');
    const adminLoginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: '9876543210', password: 'admin123' }),
    });
    const adminLoginData = await adminLoginRes.json();
    assert.strictEqual(adminLoginRes.status, 200);
    assert.strictEqual(adminLoginData.success, true);
    assert.strictEqual(adminLoginData.user.role, 'admin');
    const adminToken = adminLoginData.token;
    console.log('✅ PASS: Admin logged in, role is "admin".');

    // ----------------------------------------------------
    // Test 3: Public Operator Registration
    // ----------------------------------------------------
    console.log('\n[Test 3] Registering Operator publicly...');
    const regRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Ram Operator',
        mobile: '9876543211',
        password: 'operator123',
        confirmPassword: 'operator123',
      }),
    });
    const regData = await regRes.json();
    assert.strictEqual(regRes.status, 201);
    assert.strictEqual(regData.success, true);
    assert.strictEqual(regData.user.role, 'operator');
    console.log('✅ PASS: Operator registered successfully with role "operator".');

    // ----------------------------------------------------
    // Test 4: Operator Login
    // ----------------------------------------------------
    console.log('\n[Test 4] Operator login...');
    const opLoginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: '9876543211', password: 'operator123' }),
    });
    const opLoginData = await opLoginRes.json();
    assert.strictEqual(opLoginRes.status, 200);
    assert.strictEqual(opLoginData.user.role, 'operator');
    const operatorToken = opLoginData.token;
    console.log('✅ PASS: Operator logged in, role is "operator".');

    // ----------------------------------------------------
    // Test 5: Attempting to Register as Admin via /register (Payload Attack)
    // ----------------------------------------------------
    console.log('\n[Test 5] Attempting public registration with { role: "admin" }...');
    const attackRegRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Hacker',
        mobile: '9876543212',
        password: 'hackerpass123',
        role: 'admin', // Malicious body property
      }),
    });
    const attackRegData = await attackRegRes.json();
    assert.strictEqual(attackRegRes.status, 201);
    assert.strictEqual(attackRegData.user.role, 'operator'); // MUST BE FORCED TO OPERATOR
    console.log('✅ PASS: Backend ignored req.body.role and forced "operator".');

    // ----------------------------------------------------
    // Test 6: Attempting to Create a 2nd Admin via Admin API
    // ----------------------------------------------------
    console.log('\n[Test 6] Admin attempting to create a second Admin via /users API...');
    const createAdminRes = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Second Admin Attempt',
        mobile: '9876543213',
        password: 'adminpassword',
        role: 'admin',
      }),
    });
    const createAdminData = await createAdminRes.json();
    assert.strictEqual(createAdminRes.status, 403);
    assert.strictEqual(createAdminData.success, false);
    assert.strictEqual(createAdminData.message, 'Only one Admin account is allowed in KrishiKhata.');
    console.log('✅ PASS: Backend rejected 2nd Admin creation with 403 Forbidden.');

    // ----------------------------------------------------
    // Test 7: Mongoose Direct Save Safeguard (2nd Admin)
    // ----------------------------------------------------
    console.log('\n[Test 7] Mongoose pre-save safeguard for 2nd Admin...');
    try {
      await User.create({
        name: 'Direct DB Admin',
        mobile: '9876543299',
        password: 'password',
        role: 'admin',
      });
      assert.fail('Should have thrown single admin rule error');
    } catch (err) {
      assert.ok(err.message.includes('Only one Admin account is allowed'));
      console.log('✅ PASS: Mongoose pre-save hook threw error for 2nd Admin.');
    }

    // ----------------------------------------------------
    // Test 8: Prevent Changing Role (Operator -> Admin or Admin -> Operator)
    // ----------------------------------------------------
    console.log('\n[Test 8] Attempting to change existing user role...');
    const operatorUser = await User.findOne({ mobile: '9876543211' });
    operatorUser.role = 'admin';
    try {
      await operatorUser.save();
      assert.fail('Should have thrown role change error');
    } catch (err) {
      assert.ok(err.message.includes('User role cannot be changed'));
      console.log('✅ PASS: Mongoose pre-save hook prevented role modification.');
    }

    // ----------------------------------------------------
    // Test 9: Deactivating the Admin Account (Should be Rejected)
    // ----------------------------------------------------
    console.log('\n[Test 9] Attempting to deactivate the single Admin account...');
    const deactivateRes = await fetch(`${baseUrl}/users/${adminUser._id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'inactive' }),
    });
    const deactivateData = await deactivateRes.json();
    assert.strictEqual(deactivateRes.status, 403);
    assert.strictEqual(deactivateData.success, false);
    assert.strictEqual(deactivateData.message, 'The Admin account cannot be deactivated.');
    console.log('✅ PASS: Deactivating Admin account returned 403 Forbidden.');

    // ----------------------------------------------------
    // Test 10: Deleting the Admin Account (Should be Rejected)
    // ----------------------------------------------------
    console.log('\n[Test 10] Attempting to delete the single Admin account...');
    const deleteRes = await fetch(`${baseUrl}/users/${adminUser._id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const deleteData = await deleteRes.json();
    assert.strictEqual(deleteRes.status, 403);
    assert.strictEqual(deleteData.success, false);
    assert.strictEqual(deleteData.message, 'The Admin account cannot be deleted.');
    console.log('✅ PASS: Deleting Admin account returned 403 Forbidden.');

    // ----------------------------------------------------
    // Test 11: Operator Accessing Admin API (Should be Rejected)
    // ----------------------------------------------------
    console.log('\n[Test 11] Operator accessing Admin-only API (/api/auth/users)...');
    const opAccessRes = await fetch(`${baseUrl}/users`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${operatorToken}`,
      },
    });
    const opAccessData = await opAccessRes.json();
    assert.strictEqual(opAccessRes.status, 403);
    assert.strictEqual(opAccessData.success, false);
    console.log('✅ PASS: Operator call to Admin API returned 403 Forbidden.');

    // ----------------------------------------------------
    // Test 12: Admin Accessing Admin API (Should Succeed)
    // ----------------------------------------------------
    console.log('\n[Test 12] Admin accessing Admin-only API (/api/auth/users)...');
    const adminAccessRes = await fetch(`${baseUrl}/users`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const adminAccessData = await adminAccessRes.json();
    assert.strictEqual(adminAccessRes.status, 200);
    assert.strictEqual(adminAccessData.success, true);
    assert.ok(adminAccessData.users.length >= 2);
    console.log('✅ PASS: Admin call to Admin API returned 200 OK.');

    // ----------------------------------------------------
    // Test 13: Final Admin Count Check in MongoDB
    // ----------------------------------------------------
    console.log('\n[Test 13] Verifying total Admin count in MongoDB...');
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    assert.strictEqual(totalAdmins, 1);
    console.log(`✅ PASS: Database contains exactly ${totalAdmins} Admin account.`);

    console.log('\n====================================================');
    console.log(' 🎉 ALL 13 SINGLE ADMIN RULE TESTS PASSED PERFECTLY!');
    console.log('====================================================\n');
  } catch (error) {
    console.error('\n❌ TEST FAILURE:', error);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  }
}

runTests();
