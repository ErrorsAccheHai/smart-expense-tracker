const express = require('express');
const swaggerUi = require('swagger-ui-express');

// Import the expenses router
const expenseRoutes = require('./routes/expenseRoutes');

// Import the generated OpenAPI spec
const swaggerSpec = require('./config/swagger');

// Import middleware
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── 1. Body parsing middleware ──────────────────────────────────────────────
app.use(express.json());

// ── 2. Swagger UI ───────────────────────────────────────────────────────────
// Serves the interactive docs page at GET /api-docs
// swaggerUi.serve sets up the static assets (CSS, JS) for the UI
// swaggerUi.setup(swaggerSpec) configures the UI with our generated OpenAPI spec
// Only mount in non-test environments — no need to expose docs during testing
if (process.env.NODE_ENV !== 'test') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// ── 3. Routes ───────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Expense Tracker API is running' });
});

app.use('/expenses', expenseRoutes);

// ── 4. 404 handler ──────────────────────────────────────────────────────────
app.use(notFound);

// ── 5. Centralized error handler ────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
