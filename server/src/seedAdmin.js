const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const initAdmin = require('./config/initAdmin');

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/khetkhata';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });

    await initAdmin();

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin account:', error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

seedAdmin();
