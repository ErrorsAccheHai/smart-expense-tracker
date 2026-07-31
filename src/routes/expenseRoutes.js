const express = require('express');
const router = express.Router();

const expenseController = require('../controllers/expenseController');
const { validateCreateExpense } = require('../middleware/validateExpense');

// ─────────────────────────────────────────────────────────────────────────────
// POST /expenses
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /expenses:
 *   post:
 *     summary: Create a new expense
 *     description: Adds a new expense to the data store. All three fields are required.
 *     tags:
 *       - Expenses
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExpenseBody'
 *     responses:
 *       201:
 *         description: Expense created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
 *       400:
 *         description: Validation failed — one or more required fields are missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 */
router.post('/', validateCreateExpense, expenseController.createExpense);

// ─────────────────────────────────────────────────────────────────────────────
// GET /expenses
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /expenses:
 *   get:
 *     summary: Get all expenses
 *     description: >
 *       Returns all expenses. Optionally filter by category using the `category`
 *       query parameter. The filter is case-insensitive.
 *     tags:
 *       - Expenses
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter expenses by category (case-insensitive)
 *         example: Food
 *     responses:
 *       200:
 *         description: A list of expenses (may be empty)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Expense'
 */
router.get('/', expenseController.getExpenses);

// ─────────────────────────────────────────────────────────────────────────────
// GET /expenses/total
// Note: registered BEFORE /:id so Express doesn't treat "total" as an ID value
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /expenses/total:
 *   get:
 *     summary: Get total expense amount
 *     description: >
 *       Returns the sum of all expense amounts, the number of expenses included,
 *       and the category filter applied. Optionally filter by category.
 *     tags:
 *       - Expenses
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter totals by category (case-insensitive)
 *         example: Food
 *     responses:
 *       200:
 *         description: Total calculation result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TotalResponse'
 */
router.get('/total', expenseController.getTotalExpenses);

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /expenses/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /expenses/{id}:
 *   delete:
 *     summary: Delete an expense by ID
 *     description: Permanently removes the expense with the given ID from the data store.
 *     tags:
 *       - Expenses
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The UUID of the expense to delete
 *         example: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d
 *     responses:
 *       200:
 *         description: Expense deleted successfully — returns the deleted expense
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
 *       404:
 *         description: No expense found with the given ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
