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

// Export the router so app.js can mount it
module.exports = router;
