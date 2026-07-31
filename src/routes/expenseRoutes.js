// Express Router lets us define routes in separate files and mount them in app.js
// This keeps app.js clean — it doesn't need to know about every single route
const express = require('express');
const router = express.Router();

// Import the controller that handles expense-related requests
const expenseController = require('../controllers/expenseController');

// Define the route: HTTP POST method on the path '/'
// When this router is mounted at '/expenses' in app.js,
// the full path becomes POST /expenses
router.post('/', expenseController.createExpense);

// Define the route: HTTP GET method on the path '/'
// Handles both GET /expenses and GET /expenses?category=Food
// Express automatically makes req.query available — no extra setup needed
router.get('/', expenseController.getExpenses);

// Define the route: GET /expenses/total
// IMPORTANT: This must be registered BEFORE any '/:id' route (added in a future step)
// If /:id came first, Express would match "total" as an ID value and call the wrong handler
// Rule of thumb: specific static paths always go above dynamic parameter paths
router.get('/total', expenseController.getTotalExpenses);

// Export the router so app.js can mount it
module.exports = router;
