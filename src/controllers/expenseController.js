// Import the service layer — the controller delegates all business logic here
const expenseService = require('../services/expenseService');

// --- Controller: POST /expenses ---
// req  = the incoming HTTP request (contains headers, body, params, etc.)
// res  = the outgoing HTTP response (we use this to send data back to the client)
// next = a function to pass errors to Express's error handler (used in try/catch)
async function createExpense(req, res, next) {
  try {
    // Destructure the expected fields from the request body
    // If the client sent: { "title": "Lunch", "amount": 12.50, "category": "Food" }
    // Then: title = "Lunch", amount = 12.50, category = "Food"
    const { title, amount, category } = req.body;

    // --- Input Validation ---
    // We must validate before touching any data
    // If required fields are missing, respond immediately with 400 Bad Request
    // 400 means: "The client sent a request with invalid or missing data"
    if (!title || !amount || !category) {
      return res.status(400).json({
        error: 'title, amount, and category are required fields',
      });
    }

    // Validate that amount is a positive number
    // Number() converts the value — if it can't convert, it returns NaN
    // isNaN checks for that, and we also ensure it's greater than zero
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        error: 'amount must be a positive number',
      });
    }

    // Delegate to the service layer to create the expense
    // We pass only the validated, clean values — never the raw req.body
    const newExpense = await expenseService.createExpense(title, Number(amount), category);

    // Respond with 201 Created — this is the correct HTTP status for a successful POST
    // 200 OK means "request succeeded", but 201 specifically means "a resource was created"
    res.status(201).json(newExpense);

  } catch (error) {
    // If anything unexpected goes wrong (e.g. file system error),
    // pass the error to Express's next() which will trigger the error handler
    next(error);
  }
}

// --- Controller: GET /expenses ---
// Handles both GET /expenses and GET /expenses?category=Food
async function getExpenses(req, res, next) {
  try {
    // req.query is an object containing all query parameters from the URL
    // For GET /expenses?category=Food  →  req.query = { category: 'Food' }
    // For GET /expenses                →  req.query = {}  (empty object)
    // Destructuring gives us undefined if the key doesn't exist — that's fine,
    // because our service treats undefined as "no filter"
    const { category } = req.query;

    // Delegate to the service, passing the category (may be undefined — that's OK)
    const expenses = await expenseService.getAllExpenses(category);

    // 200 OK is correct here — we're retrieving an existing resource, not creating one
    // We always return an array, even if it's empty []
    // Returning an empty array is better than 404 for an empty collection —
    // 404 means "this route doesn't exist", not "no items found"
    res.status(200).json(expenses);

  } catch (error) {
    next(error);
  }
}

// Export both controller functions so the route can use them
module.exports = { createExpense, getExpenses };
