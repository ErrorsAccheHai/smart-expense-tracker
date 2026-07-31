// Middleware runs between the route and the controller
// It receives the same (req, res, next) signature as a controller
// The key difference: on success it calls next() instead of res.json()

// --- Middleware: Validate POST /expenses request body ---
function validateCreateExpense(req, res, next) {
  // Destructure the three required fields from the request body
  const { title, amount, category } = req.body;

  // Collect all validation errors rather than stopping at the first one
  // This gives the client all the problems at once instead of one at a time
  // Better UX: they fix everything in one round trip instead of many
  const errors = [];

  // --- Validate title ---
  // typeof check ensures it's actually a string, not a number or boolean
  // .trim() removes whitespace — "   " should not count as a valid title
  if (!title || typeof title !== 'string' || title.trim() === '') {
    errors.push('title is required and must be a non-empty string');
  }

  // --- Validate amount ---
  // Number() converts the value to a number — returns NaN if it can't
  // isNaN catches NaN; we also ensure it's strictly greater than zero
  // amount === undefined is caught by the !amount check first
  if (amount === undefined || amount === null) {
    errors.push('amount is required');
  } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
    errors.push('amount must be a positive number');
  }

  // --- Validate category ---
  if (!category || typeof category !== 'string' || category.trim() === '') {
    errors.push('category is required and must be a non-empty string');
  }

  // If there are any validation errors, respond immediately with 400 Bad Request
  // The controller will never run — this is the "gate" pattern
  // We return here to stop execution; without return, next() would also be called
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // All fields are valid — pass control to the next function in the chain
  // In the route definition, "next" will be the controller's createExpense function
  next();
}

module.exports = { validateCreateExpense };
