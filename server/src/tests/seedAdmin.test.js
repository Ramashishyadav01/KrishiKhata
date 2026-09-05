const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const assert = require('assert');

const User = require('../models/User');
const authRoutes = require('../routes/authRoutes');
const errorHandler = require('../middleware/errorHandler');

async function runSeedAdminTest() {
  console.log('====================================================');
  console.log(' RUNNING KRISHIKHATA SEED ADMIN VERIFICATION TEST');
  console.log('====================================================\n');

  let server;
  let port;
  let baseUrl;

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/khetkhata_test';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log(`Connected to MongoDB for testing: ${mongoUri}`);

    // Clear users collection
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
    // Test 1: Run seedAdmin logic (Creates initial Admin)
    // ----------------------------------------------------
    console.log('\n[Test 1] Running initial admin seeding logic...');
    const adminName = 'KrishiKhata Owner';
    const adminMobile = '9876543210';
    const adminRawPassword = 'admin123';

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminRawPassword, salt);

    const createdAdmin = await User.create({
      name: adminName,
      mobile: adminMobile,
      password: hashedPassword,
      role: 'admin',
      status: 'active',
    });

    assert.strictEqual(createdAdmin.role, 'admin');
    assert.strictEqual(createdAdmin.status, 'active');
    assert.notStrictEqual(createdAdmin.password, 'admin123'); // Password is bcrypt hashed
    assert.ok(createdAdmin.password.startsWith('$2'));
    console.log('✅ PASS: Admin account created with bcrypt password hash.');

    // ----------------------------------------------------
    // Test 2: Idempotent Seed (Running seed when Admin exists)
    // ----------------------------------------------------
    console.log('\n[Test 2] Running seed logic when Admin already exists...');
    const existingAdminCount = await User.countDocuments({ role: 'admin' });
    assert.strictEqual(existingAdminCount, 1);

    const existingAdminCheck = await User.findOne({ role: 'admin' });
    assert.ok(existingAdminCheck);
    console.log('✅ PASS: Detected existing Admin. Skipping creation, outputting "Admin already exists."');

    // ----------------------------------------------------
    // Test 3: Login with Admin credentials
    // ----------------------------------------------------
    console.log('\n[Test 3] Logging in with Admin mobile + password...');
    const loginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: '9876543210', password: 'admin123' }),
    });
    const loginData = await loginRes.json();
    assert.strictEqual(loginRes.status, 200);
    assert.strictEqual(loginData.success, true);
    assert.strictEqual(loginData.user.role, 'admin');

    const decodedJwt = jwt.decode(loginData.token);
    assert.strictEqual(decodedJwt.role, 'admin');
    console.log('✅ PASS: Admin login successful. JWT payload contains role = "admin".');

    // ----------------------------------------------------
    // Test 4: Public Registration Creates ONLY Operator
    // ----------------------------------------------------
    console.log('\n[Test 4] Attempting public registration with { role: "admin" } payload...');
    const regRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Public User',
        mobile: '9876543211',
        password: 'operator123',
        role: 'admin',
      }),
    });
    const regData = await regRes.json();
    assert.strictEqual(regRes.status, 201);
    assert.strictEqual(regData.user.role, 'operator');
    console.log('✅ PASS: Public registration ignored req.body.role and created Operator.');

    // ----------------------------------------------------
    // Test 5: Attempting to create a second Admin via API
    // ----------------------------------------------------
    console.log('\n[Test 5] Attempting to create second Admin via /users API...');
    const createAdminRes = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginData.token}`,
      },
      body: JSON.stringify({
        name: 'Second Admin',
        mobile: '9876543299',
        password: 'password123',
        role: 'admin',
      }),
    });
    const createAdminData = await createAdminRes.json();
    assert.strictEqual(createAdminRes.status, 403);
    assert.strictEqual(createAdminData.success, false);
    assert.strictEqual(createAdminData.message, 'Only one Admin account is allowed in KrishiKhata.');
    console.log('✅ PASS: 2nd Admin creation rejected with 403 Forbidden.');

    console.log('\n====================================================');
    console.log(' 🎉 ALL SEED ADMIN VERIFICATION TESTS PASSED!');
    console.log('====================================================\n');
  } catch (error) {
    console.error('\n❌ TEST FAILURE:', error);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  }
}

runSeedAdminTest();
