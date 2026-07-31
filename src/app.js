const express = require('express');

// Import the expenses router
const expenseRoutes = require('./routes/expenseRoutes');

// Import middleware — order of import doesn't matter, order of registration does
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── 1. Body parsing middleware ──────────────────────────────────────────────
// Must come before any routes that read req.body
// Without this, req.body is undefined for POST requests
app.use(express.json());

// ── 2. Routes ───────────────────────────────────────────────────────────────
// Health check — simple liveness probe
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Expense Tracker API is running' });
});

// Mount the expense routes at the '/expenses' prefix
app.use('/expenses', expenseRoutes);

// ── 3. 404 handler ──────────────────────────────────────────────────────────
// Registered AFTER all real routes
// Any request that didn't match a route above reaches this
app.use(notFound);

// ── 4. Centralized error handler ────────────────────────────────────────────
// Must be registered LAST — after routes and the 404 handler
// Receives anything passed via next(error) from any middleware or controller above
app.use(errorHandler);

module.exports = app;
