// fs/promises gives us the async file system methods (readFile, writeFile)
// Using the promises version means we can use async/await instead of callbacks
const fs = require('fs/promises');

// path helps us build file paths that work on any operating system
// On Windows paths use \, on Linux/Mac they use / — path.join handles this for us
const path = require('path');

// uuidv4 generates a random, unique ID string each time it's called
// Example output: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
const { v4: uuidv4 } = require('uuid');

// Build an absolute path to the data file
// __dirname is the directory of THIS file (src/services/)
// We go up one level (..) to src/, then up again to the project root, then into data/
// Result: /absolute/path/to/smart-expense-tracker/data/expenses.json
const DATA_FILE = path.join(__dirname, '..', '..', 'data', 'expenses.json');

// --- Helper: Read all expenses from the JSON file ---
// This is marked async because readFile is an I/O operation that takes time
async function readExpenses() {
  // fs.readFile reads the file contents as a raw string
  // 'utf8' tells it to decode the bytes as text, not return a Buffer object
  const data = await fs.readFile(DATA_FILE, 'utf8');

  // JSON.parse converts the raw JSON string into a JavaScript array of objects
  // e.g. '[{"id":"123","title":"Lunch"}]' → [{ id: "123", title: "Lunch" }]
  return JSON.parse(data);
}

// --- Helper: Write the full expenses array back to the JSON file ---
async function writeExpenses(expenses) {
  // JSON.stringify converts the JavaScript array back into a JSON string
  // The second argument (null) is a replacer — we don't need it, so null
  // The third argument (2) is the indentation level — makes the file human-readable
  await fs.writeFile(DATA_FILE, JSON.stringify(expenses, null, 2), 'utf8');
}

// --- Service: Create a new expense ---
// This is the function the controller will call
async function createExpense(title, amount, category) {
  // Read the current list of expenses from the file
  const expenses = await readExpenses();

  // Build the new expense object
  const newExpense = {
    id: uuidv4(),            // Generate a unique ID — this is why we need UUID
    title,                   // ES6 shorthand for title: title
    amount,
    category,
    date: new Date().toISOString(), // Store date as ISO 8601 string e.g. "2026-08-01T10:30:00.000Z"
  };

  // Add the new expense to the existing array
  expenses.push(newExpense);

  // Write the updated array back to the file
  // If we skip this step, the new expense exists only in memory and is lost on restart
  await writeExpenses(expenses);

  // Return the newly created expense so the controller can send it in the response
  return newExpense;
}

// --- Service: Get all expenses, with optional category filter ---
// The `category` parameter is optional — if not provided, all expenses are returned
async function getAllExpenses(category) {
  // Always start by reading everything from the file
  const expenses = await readExpenses();

  // If no category filter was provided, return the full list immediately
  if (!category) {
    return expenses;
  }

  // Filter the array to only include expenses whose category matches
  // .toLowerCase() on both sides makes the comparison case-insensitive
  // e.g. "food", "Food", and "FOOD" all match an expense with category "Food"
  const filtered = expenses.filter(
    (expense) => expense.category.toLowerCase() === category.toLowerCase()
  );

  return filtered;
}

// --- Service: Get total amount of expenses, with optional category filter ---
async function getTotalExpenses(category) {
  // Reuse getAllExpenses — it already handles the optional category filter
  // This avoids duplicating the read + filter logic
  const expenses = await getAllExpenses(category);

  // .reduce() iterates over every expense and accumulates a running total
  // Parameters:
  //   sum      → the running total (starts at 0, the second argument to reduce)
  //   expense  → the current item in the array on each iteration
  // On each step: new sum = old sum + this expense's amount
  // Final result: the grand total of all amounts
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Round to 2 decimal places to avoid floating point issues
  // e.g. 4.5 + 2.1 in JavaScript can produce 6.6000000000000005
  // parseFloat removes trailing zeros: "6.60" → 6.6
  const roundedTotal = parseFloat(total.toFixed(2));

  // Return a structured object, not just a number
  // This gives the client context about what the total refers to
  return {
    total: roundedTotal,
    category: category || 'all', // 'all' when no filter was applied
    count: expenses.length,       // Bonus: how many expenses were included in the sum
  };
}

// --- Service: Delete an expense by ID ---
// Returns the deleted expense object if found, or null if not found
// The controller decides what HTTP status to send based on this return value
async function deleteExpense(id) {
  const expenses = await readExpenses();

  // findIndex scans the array and returns the position of the first match
  // Returns -1 if no item matches — this is our "not found" signal
  // We compare IDs as strings (both sides are already strings, but explicit is safer)
  const index = expenses.findIndex((expense) => expense.id === id);

  // If findIndex returned -1, no expense has that ID — return null to signal "not found"
  // The controller will turn this into a 404 response
  if (index === -1) {
    return null;
  }

  // splice(index, 1) removes exactly 1 element at the given index, in place
  // It returns an array of the removed elements — we take the first (and only) one
  // e.g. expenses = [A, B, C], splice(1, 1) → expenses becomes [A, C], returns [B]
  const [deletedExpense] = expenses.splice(index, 1);

  // Persist the updated array (without the deleted item) back to the file
  await writeExpenses(expenses);

  // Return the deleted expense so the controller can include it in the response
  return deletedExpense;
}

// Export all public-facing service functions
module.exports = { createExpense, getAllExpenses, getTotalExpenses, deleteExpense };
