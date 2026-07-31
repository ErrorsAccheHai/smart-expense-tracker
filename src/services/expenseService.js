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

// Export only the public-facing service functions
// readExpenses and writeExpenses are internal helpers — we don't export them
module.exports = { createExpense, getAllExpenses };
