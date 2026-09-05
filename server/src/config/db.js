const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/khetkhata', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Local MongoDB Connection failed: ${error.message}`);
    console.log('Attempting in-memory MongoDB fallback...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log(`MongoDB In-Memory Server Connected: ${mongoUri}`);
    } catch (memError) {
      console.error(`MongoDB In-Memory Fallback failed: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
