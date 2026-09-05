const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

const User = require('./models/User');
const Season = require('./models/Season');
const Machine = require('./models/Machine');
const Customer = require('./models/Customer');
const Field = require('./models/Field');
const WorkEntry = require('./models/WorkEntry');
const Payment = require('./models/Payment');
const Driver = require('./models/Driver');
const DriverAttendance = require('./models/DriverAttendance');
const DriverPayment = require('./models/DriverPayment');
const Labour = require('./models/Labour');
const LabourAttendance = require('./models/LabourAttendance');
const LabourPayment = require('./models/LabourPayment');
const FuelEntry = require('./models/FuelEntry');
const Repair = require('./models/Repair');
const RiceMillEntry = require('./models/RiceMillEntry');
const BranSale = require('./models/BranSale');
const Expense = require('./models/Expense');

const seedData = async () => {
  try {
    await connectDB();
    console.log('Clearing existing database collections...');

    await Promise.all([
      User.deleteMany({}),
      Season.deleteMany({}),
      Machine.deleteMany({}),
      Customer.deleteMany({}),
      Field.deleteMany({}),
      WorkEntry.deleteMany({}),
      Payment.deleteMany({}),
      Driver.deleteMany({}),
      DriverAttendance.deleteMany({}),
      DriverPayment.deleteMany({}),
      Labour.deleteMany({}),
      LabourAttendance.deleteMany({}),
      LabourPayment.deleteMany({}),
      FuelEntry.deleteMany({}),
      Repair.deleteMany({}),
      RiceMillEntry.deleteMany({}),
      BranSale.deleteMany({}),
      Expense.deleteMany({}),
    ]);

    console.log('Seeding Users...');
    const salt = await bcrypt.genSalt(10);
    const adminName = process.env.ADMIN_NAME || 'Farm Owner (Admin)';
    const adminMobile = process.env.ADMIN_MOBILE || '9876543210';
    const adminRawPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminPassword = await bcrypt.hash(adminRawPassword, salt);
    const operatorPassword = await bcrypt.hash('operator123', salt);

    let admin = await User.findOne({ role: 'admin' });
    if (admin) {
      console.log('Admin account already exists. Skipping Admin creation.');
    } else {
      admin = await User.create({
        name: adminName,
        mobile: adminMobile,
        email: 'admin@krishikhata.com',
        password: adminPassword,
        role: 'admin',
      });
    }

    const employee = await User.create({
      name: 'Manager / Operator',
      mobile: '9876543211',
      email: 'operator@krishikhata.com',
      password: operatorPassword,
      role: 'operator',
    });

    console.log('Seeding Seasons...');
    const seasonKharif2026 = await Season.create({
      name: 'Kharif 2026',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-10-31'),
      status: 'Active',
      notes: 'Current Kharif Season',
    });

    const seasonRabi2025 = await Season.create({
      name: 'Rabi 2025-26',
      startDate: new Date('2025-11-01'),
      endDate: new Date('2026-04-30'),
      status: 'Completed',
      notes: 'Previous Rabi Season',
    });

    console.log('Seeding Mandatory Machines...');
    const machinesData = [
      { nameEn: 'Tractor', nameHi: 'ट्रैक्टर', billingUnit: 'Hour', defaultRate: 1000 },
      { nameEn: 'Trolley', nameHi: 'ट्रॉली', billingUnit: 'Trip', defaultRate: 800 },
      { nameEn: 'Rotavator', nameHi: 'रोटावेटर', billingUnit: 'Bigha', defaultRate: 2000 },
      { nameEn: '9 Harrah', nameHi: '9 हर्रा', billingUnit: 'Bigha', defaultRate: 1500 },
      { nameEn: 'TY', nameHi: 'टी.वाई.', billingUnit: 'Bigha', defaultRate: 1600 },
      { nameEn: 'Dhan Thresher', nameHi: 'धान थ्रेशर', billingUnit: 'Hour', defaultRate: 1200 },
      { nameEn: 'Gehu Thresher', nameHi: 'गेहूँ थ्रेशर', billingUnit: 'Hour', defaultRate: 1100 },
      { nameEn: 'Palewa', nameHi: 'पलेवा', billingUnit: 'Hour', defaultRate: 800 },
      { nameEn: 'Rice Mill', nameHi: 'राइस मिल', billingUnit: 'Quintal', defaultRate: 250 },
      { nameEn: 'Bran', nameHi: 'चोकर', billingUnit: 'Quintal', defaultRate: 2500 },
    ];

    const machines = await Machine.insertMany(machinesData);
    const mRotavator = machines.find((m) => m.nameEn === 'Rotavator');
    const mTrolley = machines.find((m) => m.nameEn === 'Trolley');
    const mDhanThresher = machines.find((m) => m.nameEn === 'Dhan Thresher');
    const mGehuThresher = machines.find((m) => m.nameEn === 'Gehu Thresher');
    const mTractor = machines.find((m) => m.nameEn === 'Tractor');

    console.log('Seeding Drivers & Labour...');
    const driver1 = await Driver.create({
      name: 'Raj Kumar',
      mobile: '9123456789',
      address: 'Rampur Village',
      joiningDate: new Date('2025-01-10'),
      salaryType: 'Daily',
      dailyRate: 600,
    });

    const driver2 = await Driver.create({
      name: 'Vijay Singh',
      mobile: '9123456788',
      address: 'Lakshmipur',
      joiningDate: new Date('2025-02-01'),
      salaryType: 'Monthly',
      monthlySalary: 18000,
    });

    const labour1 = await Labour.create({ name: 'Ram', mobile: '9111111111', dailyWage: 500 });
    const labour2 = await Labour.create({ name: 'Shyam', mobile: '9222222222', dailyWage: 500 });
    const labour3 = await Labour.create({ name: 'Mohan', mobile: '9333333333', dailyWage: 500 });

    console.log('Seeding Attendance & Payments for Drivers & Labour...');
    await DriverAttendance.create({
      driver: driver1._id,
      date: new Date('2026-08-28'),
      status: 'Present',
      dailyEarned: 600,
      machine: mTractor._id,
      workPerformed: 'Rotavator operation at Rampur',
    });
    await DriverAttendance.create({
      driver: driver1._id,
      date: new Date('2026-08-29'),
      status: 'Present',
      dailyEarned: 600,
      machine: mTractor._id,
      workPerformed: 'Thresher operation',
    });

    await DriverPayment.create({
      driver: driver1._id,
      date: new Date('2026-08-30'),
      amount: 1000,
      paymentMethod: 'Cash',
      season: seasonKharif2026._id,
      notes: 'Advance salary',
    });

    await LabourAttendance.create({ labour: labour1._id, date: new Date('2026-08-28'), status: 'Present', dailyEarned: 500 });
    await LabourAttendance.create({ labour: labour2._id, date: new Date('2026-08-28'), status: 'Present', dailyEarned: 500 });
    await LabourAttendance.create({ labour: labour3._id, date: new Date('2026-08-28'), status: 'Half Day', dailyEarned: 250 });

    await LabourPayment.create({
      labour: labour1._id,
      date: new Date('2026-08-30'),
      amount: 500,
      paymentMethod: 'Cash',
      season: seasonKharif2026._id,
    });

    console.log('Seeding Customers & Fields...');
    const custRamesh = await Customer.create({
      name: 'Ramesh Yadav',
      mobile: '9988776655',
      village: 'Rampur',
      address: 'Near Old Water Tank, Rampur',
    });

    const custSuresh = await Customer.create({
      name: 'Suresh Verma',
      mobile: '9988776644',
      village: 'Lakshmipur',
      address: 'Main Road, Lakshmipur',
    });

    const custDinesh = await Customer.create({
      name: 'Dinesh Singh',
      mobile: '9988776633',
      village: 'Rampur',
      address: 'East Tola, Rampur',
    });

    const fieldRamesh1 = await Field.create({
      customer: custRamesh._id,
      name: 'Field 1 (North Khet)',
      village: 'Rampur',
      bigha: 3,
      bissa: 10,
    });

    const fieldRamesh2 = await Field.create({
      customer: custRamesh._id,
      name: 'Field 2 (Bada Khet)',
      village: 'Lakshmipur',
      bigha: 2,
      bissa: 0,
    });

    const fieldSuresh1 = await Field.create({
      customer: custSuresh._id,
      name: 'Field 1 (Badi Baag)',
      village: 'Lakshmipur',
      bigha: 4,
      bissa: 5,
    });

    console.log('Seeding Work Entries & Payments...');
    // Ramesh: 3 Bigha 10 Bissa Rotavator @ 2000/Bigha = 3.5 * 2000 = 7000
    const w1 = await WorkEntry.create({
      customer: custRamesh._id,
      field: fieldRamesh1._id,
      village: 'Rampur',
      date: new Date('2026-08-01'),
      season: seasonKharif2026._id,
      machine: mRotavator._id,
      billingUnit: 'Bigha',
      bigha: 3,
      bissa: 10,
      totalBissa: 70,
      rate: 2000,
      totalAmount: 7000,
      paidAmount: 4000,
      paymentStatus: 'PARTIAL',
      driver: driver1._id,
      description: 'Rotavator land preparation',
    });

    await Payment.create({
      customer: custRamesh._id,
      workEntry: w1._id,
      date: new Date('2026-08-01'),
      amount: 4000,
      paymentMethod: 'Cash',
      season: seasonKharif2026._id,
      notes: 'Initial cash paid',
    });

    await Payment.create({
      customer: custRamesh._id,
      date: new Date('2026-08-05'),
      amount: 1000,
      paymentMethod: 'UPI',
      season: seasonKharif2026._id,
      notes: 'GPay payment',
    });

    // Ramesh Trolley Work: 4 Trips @ 800 = 3200
    await WorkEntry.create({
      customer: custRamesh._id,
      field: fieldRamesh2._id,
      village: 'Lakshmipur',
      date: new Date('2026-08-10'),
      season: seasonKharif2026._id,
      machine: mTrolley._id,
      billingUnit: 'Trip',
      trips: 4,
      rate: 800,
      totalAmount: 3200,
      paidAmount: 0,
      paymentStatus: 'PENDING',
      driver: driver1._id,
      description: 'Manure transport',
    });

    // Suresh Verma Dhan Thresher: 5 Hours @ 1200 = 6000
    await WorkEntry.create({
      customer: custSuresh._id,
      field: fieldSuresh1._id,
      village: 'Lakshmipur',
      date: new Date('2026-08-15'),
      season: seasonKharif2026._id,
      machine: mDhanThresher._id,
      billingUnit: 'Hour',
      hours: 5,
      rate: 1200,
      totalAmount: 6000,
      paidAmount: 6000,
      paymentStatus: 'PAID',
      driver: driver2._id,
      description: 'Paddy threshing',
    });

    await Payment.create({
      customer: custSuresh._id,
      date: new Date('2026-08-15'),
      amount: 6000,
      paymentMethod: 'Bank Transfer',
      season: seasonKharif2026._id,
    });

    console.log('Seeding Rice Mill & Bran Sales...');
    await RiceMillEntry.create({
      date: new Date('2026-08-20'),
      season: seasonKharif2026._id,
      customer: custDinesh._id,
      riceProcessedQuintal: 100,
      branProducedQuintal: 8,
      processingRatePerQuintal: 250,
      totalProcessingCharge: 25000,
      electricityCost: 3500,
      labourCost: 2000,
      notes: 'Paddy processing batch 1',
    });

    // Sell 5 Quintal Bran @ 2500 = 12500
    await BranSale.create({
      date: new Date('2026-08-22'),
      season: seasonKharif2026._id,
      buyer: 'Verma Dairy Farm',
      buyerMobile: '9811223344',
      quantityQuintal: 5,
      ratePerQuintal: 2500,
      totalSaleAmount: 12500,
      amountReceived: 10000,
      pendingAmount: 2500,
      paymentMethod: 'UPI',
      notes: '5 Quintal chokar sold to dairy',
    });

    console.log('Seeding Fuel, Repairs, and General Expenses...');
    await FuelEntry.create({
      date: new Date('2026-08-02'),
      season: seasonKharif2026._id,
      machine: mTractor._id,
      fuelType: 'Diesel',
      quantity: 50,
      ratePerLitre: 92,
      totalAmount: 4600,
      meterReading: '1420 hrs',
      vendor: 'Kisan Fuel Station',
    });

    await Repair.create({
      machine: mTractor._id,
      date: new Date('2026-08-12'),
      season: seasonKharif2026._id,
      problem: 'Hydraulic leak and clutch adjustment',
      partsCost: 3500,
      labourCost: 1500,
      totalCost: 5000,
      mechanic: 'Sharma Tractor Workshop',
      status: 'Completed',
    });

    await Expense.create({
      category: 'Electricity',
      date: new Date('2026-08-25'),
      season: seasonKharif2026._id,
      amount: 4500,
      description: 'Rice Mill Monthly Power Bill',
      vendor: 'UPPCL State Electricity Board',
    });

    console.log('\n==========================================');
    console.log(' SUCCESS: KrishiKhata DB Seeded Successfully!');
    console.log('==========================================');
    console.log(`Admin Account:    ${process.env.ADMIN_MOBILE || '9876543210'} / ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    console.log('Operator Account: 9876543211 / operator123');
    console.log('==========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
