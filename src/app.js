const express = require('express');

// Import the expenses router
const expenseRoutes = require('./routes/expenseRoutes');

const app = express();

// Middleware: parse incoming JSON request bodies
app.use(express.json());

// Mount the expense routes at the '/expenses' prefix
// This means every route defined in expenseRoutes.js will be prefixed with /expenses
// So router.post('/') becomes POST /expenses
// So router.get('/:id') would become GET /expenses/:id (future steps)
app.use('/expenses', expenseRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Expense Tracker API is running' });
});

module.exports = app;
