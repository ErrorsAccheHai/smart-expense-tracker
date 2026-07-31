# Smart Expense Tracker API

A REST API for tracking personal expenses, built with Node.js and Express.js as part of a software engineering apprenticeship assignment.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js | HTTP framework — routing, middleware, request/response handling |
| UUID v11 | Generating unique IDs for each expense |
| JSON file | Local data storage (`data/expenses.json`) |
| Jest | Test framework |
| Supertest | HTTP integration testing without starting a live server |
| swagger-jsdoc | Generates OpenAPI 3.0 spec from JSDoc comments |
| swagger-ui-express | Serves interactive API documentation at `/api-docs` |

---

## Project Structure

```
smart-expense-tracker/
├── data/
│   ├── expenses.json          # Live data store
│   └── test-expenses.json     # Isolated data store used during tests
├── src/
│   ├── app.js                 # Express app setup (no server.listen here)
│   ├── config/
│   │   └── swagger.js         # OpenAPI spec definition and swagger-jsdoc config
│   ├── controllers/
│   │   └── expenseController.js  # HTTP layer — reads req, calls service, sends res
│   ├── middleware/
│   │   ├── validateExpense.js    # Input validation for POST /expenses
│   │   ├── notFound.js           # 404 handler for unknown routes
│   │   └── errorHandler.js       # Centralized error handler (4-argument Express middleware)
│   ├── routes/
│   │   └── expenseRoutes.js      # Route definitions with @openapi JSDoc comments
│   └── services/
│       └── expenseService.js     # Business logic — file read/write, filter, total, delete
├── tests/
│   └── expenses.test.js       # Jest + Supertest integration tests (20 tests)
├── server.js                  # Entry point — calls app.listen()
└── package.json
```

---

## Getting Started

**Prerequisites:** Node.js v18 or higher

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

The server starts at `http://localhost:3000`. Nodemon watches for file changes and restarts automatically.

### Run in production mode

```bash
npm start
```

### Run tests

```bash
npm test
```

Tests run in isolation using `data/test-expenses.json`. The live data file is never touched during tests.

---

## API Endpoints

### Base URL

```
http://localhost:3000
```

### Health Check

```
GET /health
```

Returns a simple status message to confirm the server is running.

---

### Expenses

#### Create an expense

```
POST /expenses
Content-Type: application/json
```

**Request body:**

```json
{
  "title": "Coffee",
  "amount": 4.50,
  "category": "Food"
}
```

All three fields are required. `amount` must be a positive number.

**Response — 201 Created:**

```json
{
  "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "title": "Coffee",
  "amount": 4.5,
  "category": "Food",
  "date": "2026-08-01T10:30:00.000Z"
}
```

**Response — 400 Bad Request (validation failure):**

```json
{
  "errors": [
    "title is required and must be a non-empty string",
    "amount must be a positive number"
  ]
}
```

---

#### Get all expenses

```
GET /expenses
GET /expenses?category=Food
```

Returns all expenses. The optional `category` query parameter filters results. The filter is case-insensitive — `?category=food` and `?category=Food` return the same results.

Returns an empty array `[]` if no expenses exist or no category matches (never a 404).

**Response — 200 OK:**

```json
[
  {
    "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "title": "Coffee",
    "amount": 4.5,
    "category": "Food",
    "date": "2026-08-01T10:30:00.000Z"
  }
]
```

---

#### Get total amount

```
GET /expenses/total
GET /expenses/total?category=Food
```

Returns the sum of all expense amounts. Optionally filter by category.

**Response — 200 OK:**

```json
{
  "total": 17.0,
  "category": "all",
  "count": 3
}
```

`category` is `"all"` when no filter was applied. `count` is the number of expenses included in the sum.

---

#### Delete an expense

```
DELETE /expenses/:id
```

Removes the expense with the given ID. Returns the deleted expense in the response body.

**Response — 200 OK:**

```json
{
  "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "title": "Coffee",
  "amount": 4.5,
  "category": "Food",
  "date": "2026-08-01T10:30:00.000Z"
}
```

**Response — 404 Not Found:**

```json
{
  "error": "Expense with id '9b1deb4d-...' not found"
}
```

---

## Interactive Documentation

When the server is running, Swagger UI is available at:

```
http://localhost:3000/api-docs
```

You can read endpoint descriptions and make real API calls directly from the browser. The docs are generated automatically from `@openapi` JSDoc comments in `src/routes/expenseRoutes.js`.

---

## Architecture Overview

The project follows a three-layer architecture:

```
Route → Controller → Service → JSON file
```

- **Route** — maps HTTP method + URL to a controller function
- **Controller** — reads `req`, validates input (via middleware), calls the service, sends `res`
- **Service** — contains all business logic; reads and writes the JSON file; has no knowledge of Express

This separation means the service can be tested or replaced without touching the HTTP layer.

**Middleware pipeline (in registration order):**

```
express.json() → Swagger UI → Routes → [validation] → Controller
                                                            ↓ next(error)
                                    notFound (404)    errorHandler (500)
```

---

## Design Decisions

**Why `app.js` and `server.js` are separate**
Supertest needs to import the Express app without calling `app.listen()`. Separating them means tests work cleanly and the app is also easy to start normally.

**Why `GET /expenses/total` is registered before `DELETE /:id`**
Express matches routes top to bottom. If `/:id` were registered first, the string `"total"` would be captured as an ID value and routed to the wrong handler. Static paths must come before dynamic ones.

**Why validation is middleware, not inline in the controller**
Validation at a dedicated middleware layer means the controller receives clean, pre-validated data. It also means validation logic is in one place — easier to update and test independently.

**Why the error handler has four parameters**
Express identifies error-handling middleware specifically by the presence of four parameters `(err, req, res, next)`. Three parameters and it becomes a regular middleware, invisible to Express's error routing.

**Why `findIndex` instead of `filter` for delete**
`filter` can't tell you whether it removed anything. `findIndex` returns `-1` when nothing matches, which maps directly to a 404 response. The intent is explicit.

**Why amounts are rounded with `toFixed(2)` + `parseFloat`**
JavaScript floating point arithmetic can produce results like `0.1 + 0.2 = 0.30000000000000004`. `toFixed(2)` rounds to two decimal places; `parseFloat` removes trailing zeros.

---

## Running Tests

```bash
npm test
```

20 integration tests covering:
- POST /expenses — valid creation, all validation failure cases
- GET /expenses — empty collection, filtering, case-insensitive matching
- GET /expenses/total — sum accuracy, category filtering, floating point rounding
- DELETE /expenses/:id — successful delete, persistence verification, 404 handling
- Error handling — unknown routes return JSON (not HTML)

Tests use `data/test-expenses.json` and reset it to `[]` before each test to ensure full isolation.
