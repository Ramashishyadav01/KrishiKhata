const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');
const initAdmin = require('./config/initAdmin');

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await initAdmin();
  app.listen(PORT, () => {
    console.log(`KrishiKhata Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
});
