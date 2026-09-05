const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/seasons', require('./routes/seasonRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/fields', require('./routes/fieldRoutes'));
app.use('/api/machines', require('./routes/machineRoutes'));
app.use('/api/work-entries', require('./routes/workEntryRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/ledger', require('./routes/ledgerRoutes'));
app.use('/api/fuel-entries', require('./routes/fuelRoutes'));
app.use('/api/repairs', require('./routes/repairRoutes'));
app.use('/api/drivers', require('./routes/driverRoutes'));
app.use('/api/labour', require('./routes/labourRoutes'));
app.use('/api/rice-mill', require('./routes/riceMillRoutes'));
app.use('/api/bran-sales', require('./routes/branSaleRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'OK', app: 'KrishiKhata Agriculture Management Backend' });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
