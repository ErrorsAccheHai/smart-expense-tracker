const request = require('supertest');
const fs = require('fs/promises');
const path = require('path');
const app = require('../src/app');

// Path to the test data file — must match what the service uses when NODE_ENV=test
const TEST_DATA_FILE = path.join(__dirname, '..', 'data', 'test-expenses.json');

// ── Test lifecycle ────────────────────────────────────────────────────────────
// beforeEach runs before EVERY test in this file
// We reset the file to an empty array so every test starts from a clean slate
// Without this, a POST in test 1 would affect the data that test 2 reads
beforeEach(async () => {
  await fs.writeFile(TEST_DATA_FILE, JSON.stringify([]), 'utf8');
});

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCK 1 — POST /expenses
// ═══════════════════════════════════════════════════════════════════════════════
describe('POST /expenses', () => {

  // TEST 1
  // What:    Send a valid expense body and check the full response
  // Why:     This is the happy path — the most important case to get right
  // Expected: 201 status, response contains all sent fields plus a UUID id and a date
  it('should create a new expense and return 201 with the created object', async () => {
    const response = await request(app)
      .post('/expenses')
      .send({ title: 'Coffee', amount: 4.5, category: 'Food' });

    expect(response.status).toBe(201);

    // Check every field we care about
    expect(response.body.title).toBe('Coffee');
    expect(response.body.amount).toBe(4.5);
    expect(response.body.category).toBe('Food');

    // The service should have generated a UUID — verify it exists and is a string
    expect(typeof response.body.id).toBe('string');
    expect(response.body.id.length).toBeGreaterThan(0);

    // The service should have added an ISO date string
    expect(typeof response.body.date).toBe('string');
  });

  // TEST 2
  // What:    Send a body with no title field
  // Why:     Validation middleware must reject missing required fields before
  //          the controller or service ever runs
  // Expected: 400 status, errors array mentions 'title'
  it('should return 400 when title is missing', async () => {
    const response = await request(app)
      .post('/expenses')
      .send({ amount: 10, category: 'Food' });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors.some(e => e.toLowerCase().includes('title'))).toBe(true);
  });

  // TEST 3
  // What:    Send a body with no amount field
  // Why:     Same validation gate — amount is required
  // Expected: 400 status, errors array mentions 'amount'
  it('should return 400 when amount is missing', async () => {
    const response = await request(app)
      .post('/expenses')
      .send({ title: 'Coffee', category: 'Food' });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors.some(e => e.toLowerCase().includes('amount'))).toBe(true);
  });

  // TEST 4
  // What:    Send a body with no category field
  // Why:     Same validation gate — category is required
  // Expected: 400 status, errors array mentions 'category'
  it('should return 400 when category is missing', async () => {
    const response = await request(app)
      .post('/expenses')
      .send({ title: 'Coffee', amount: 4.5 });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors.some(e => e.toLowerCase().includes('category'))).toBe(true);
  });

  // TEST 5
  // What:    Send a negative amount
  // Why:     An expense cannot have a negative cost — the amount rule must catch this
  // Expected: 400 status with an amount-related error
  it('should return 400 when amount is negative', async () => {
    const response = await request(app)
      .post('/expenses')
      .send({ title: 'Coffee', amount: -10, category: 'Food' });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors.some(e => e.toLowerCase().includes('amount'))).toBe(true);
  });

  // TEST 6
  // What:    Send a string that is not a number as the amount
  // Why:     Clients might accidentally send "abc" — the validator must catch this
  // Expected: 400 status with an amount-related error
  it('should return 400 when amount is not a number', async () => {
    const response = await request(app)
      .post('/expenses')
      .send({ title: 'Coffee', amount: 'abc', category: 'Food' });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors.some(e => e.toLowerCase().includes('amount'))).toBe(true);
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCK 2 — GET /expenses
// ═══════════════════════════════════════════════════════════════════════════════
describe('GET /expenses', () => {

  // TEST 7
  // What:    GET when the data file is empty
  // Why:     An empty collection must return [] not a 404 or an error
  //          Clients should always get an array they can iterate over safely
  // Expected: 200 status, empty array
  it('should return an empty array when there are no expenses', async () => {
    const response = await request(app).get('/expenses');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });

  // TEST 8
  // What:    GET after creating two expenses
  // Why:     Verifies that POST persists data and GET retrieves it correctly
  //          Tests the full read path, not just the write path
  // Expected: 200 status, array with exactly the two created expenses
  it('should return all expenses', async () => {
    // Seed two expenses first
    await request(app).post('/expenses').send({ title: 'Coffee', amount: 4.5, category: 'Food' });
    await request(app).post('/expenses').send({ title: 'Bus', amount: 2.5, category: 'Transport' });

    const response = await request(app).get('/expenses');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
  });

  // TEST 9
  // What:    GET with ?category=Food after creating expenses in two different categories
  // Why:     The filter must return only matching items, not all items
  // Expected: 200 status, array containing only the Food expense
  it('should return only expenses matching the category filter', async () => {
    await request(app).post('/expenses').send({ title: 'Coffee', amount: 4.5, category: 'Food' });
    await request(app).post('/expenses').send({ title: 'Bus', amount: 2.5, category: 'Transport' });

    const response = await request(app).get('/expenses?category=Food');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].category).toBe('Food');
  });

  // TEST 10
  // What:    GET with lowercase ?category=food when the stored value is "Food"
  // Why:     Our toLowerCase() comparison must work — this tests that specific logic
  // Expected: 200 status, the Food expense is returned despite the case mismatch
  it('should match category filter case-insensitively', async () => {
    await request(app).post('/expenses').send({ title: 'Coffee', amount: 4.5, category: 'Food' });

    const response = await request(app).get('/expenses?category=food');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
  });

  // TEST 11
  // What:    GET with a category that doesn't match anything
  // Why:     No results should be an empty array, not a 404 or an error
  // Expected: 200 status, empty array
  it('should return empty array when category filter has no matches', async () => {
    await request(app).post('/expenses').send({ title: 'Coffee', amount: 4.5, category: 'Food' });

    const response = await request(app).get('/expenses?category=Groceries');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCK 3 — GET /expenses/total
// ═══════════════════════════════════════════════════════════════════════════════
describe('GET /expenses/total', () => {

  // TEST 12
  // What:    Get the total of all expenses
  // Why:     Core happy path — verifies the reduce logic sums correctly
  // Expected: 200, total equals sum of all amounts, count matches, category is 'all'
  it('should return the correct total for all expenses', async () => {
    await request(app).post('/expenses').send({ title: 'Coffee', amount: 4.5, category: 'Food' });
    await request(app).post('/expenses').send({ title: 'Bus', amount: 2.5, category: 'Transport' });

    const response = await request(app).get('/expenses/total');

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(7);
    expect(response.body.count).toBe(2);
    expect(response.body.category).toBe('all');
  });

  // TEST 13
  // What:    Get the total filtered by category
  // Why:     Verifies that filter + reduce work correctly together
  // Expected: 200, total is only the sum of Food expenses, count is correct
  it('should return the correct total for a specific category', async () => {
    await request(app).post('/expenses').send({ title: 'Coffee', amount: 4.5, category: 'Food' });
    await request(app).post('/expenses').send({ title: 'Lunch', amount: 10, category: 'Food' });
    await request(app).post('/expenses').send({ title: 'Bus', amount: 2.5, category: 'Transport' });

    const response = await request(app).get('/expenses/total?category=Food');

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(14.5);
    expect(response.body.count).toBe(2);
  });

  // TEST 14
  // What:    Get the total when there are no expenses
  // Why:     reduce() on an empty array with initial value 0 should return 0, not error
  // Expected: 200, total is 0, count is 0
  it('should return total of 0 when there are no expenses', async () => {
    const response = await request(app).get('/expenses/total');

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(0);
    expect(response.body.count).toBe(0);
  });

  // TEST 15
  // What:    Get the total of amounts that produce a floating point result
  // Why:     JavaScript floating point: 0.1 + 0.2 = 0.30000000000000004
  //          Our toFixed(2) + parseFloat rounding must handle this correctly
  // Expected: 200, total is cleanly rounded to 2 decimal places
  it('should return a correctly rounded total for floating point amounts', async () => {
    await request(app).post('/expenses').send({ title: 'A', amount: 0.1, category: 'Test' });
    await request(app).post('/expenses').send({ title: 'B', amount: 0.2, category: 'Test' });

    const response = await request(app).get('/expenses/total');

    expect(response.status).toBe(200);
    // Without rounding this would be 0.30000000000000004
    expect(response.body.total).toBe(0.3);
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCK 4 — DELETE /expenses/:id
// ═══════════════════════════════════════════════════════════════════════════════
describe('DELETE /expenses/:id', () => {

  // TEST 16
  // What:    Delete an expense that exists
  // Why:     Core happy path — verifies the delete logic and 200 response
  // Expected: 200 status, response body is the deleted expense itself
  it('should delete an expense and return 200 with the deleted object', async () => {
    // First create an expense so we have an ID to delete
    const createResponse = await request(app)
      .post('/expenses')
      .send({ title: 'Coffee', amount: 4.5, category: 'Food' });

    const id = createResponse.body.id;

    const deleteResponse = await request(app).delete(`/expenses/${id}`);

    expect(deleteResponse.status).toBe(200);
    // The deleted item should be returned in the body
    expect(deleteResponse.body.id).toBe(id);
    expect(deleteResponse.body.title).toBe('Coffee');
  });

  // TEST 17
  // What:    Verify the expense is actually gone from the file after deletion
  // Why:     The 200 response alone doesn't prove persistence — the file must be updated
  //          This tests the writeExpenses() call inside the service
  // Expected: GET /expenses returns one fewer item after the delete
  it('should actually remove the expense from the data store', async () => {
    const createResponse = await request(app)
      .post('/expenses')
      .send({ title: 'Coffee', amount: 4.5, category: 'Food' });

    const id = createResponse.body.id;

    // Delete it
    await request(app).delete(`/expenses/${id}`);

    // Now fetch all — the deleted expense must not be present
    const getResponse = await request(app).get('/expenses');
    const ids = getResponse.body.map(e => e.id);

    expect(getResponse.body.length).toBe(0);
    expect(ids).not.toContain(id);
  });

  // TEST 18
  // What:    Try to delete an ID that doesn't exist
  // Why:     The findIndex returns -1 path must trigger a 404, not a 500
  // Expected: 404 status with a meaningful error message
  it('should return 404 when the expense ID does not exist', async () => {
    const response = await request(app).delete('/expenses/non-existent-id-abc');

    expect(response.status).toBe(404);
    expect(response.body.error).toBeDefined();
    expect(response.body.error).toContain('non-existent-id-abc');
  });

  // TEST 19
  // What:    Delete the same expense twice
  // Why:     The second delete must correctly return 404 — the item is already gone
  //          This verifies the file was updated on the first delete, not just memory
  // Expected: First delete returns 200, second delete returns 404
  it('should return 404 when deleting an already-deleted expense', async () => {
    const createResponse = await request(app)
      .post('/expenses')
      .send({ title: 'Coffee', amount: 4.5, category: 'Food' });

    const id = createResponse.body.id;

    // First delete — should succeed
    const firstDelete = await request(app).delete(`/expenses/${id}`);
    expect(firstDelete.status).toBe(200);

    // Second delete — item is gone, should 404
    const secondDelete = await request(app).delete(`/expenses/${id}`);
    expect(secondDelete.status).toBe(404);
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCK 5 — Error handling
// ═══════════════════════════════════════════════════════════════════════════════
describe('Error handling', () => {

  // TEST 20
  // What:    Make a request to a route that doesn't exist
  // Why:     The notFound middleware must return JSON, not Express's default HTML page
  //          Consistent JSON responses across all cases is an API design requirement
  // Expected: 404 status, response is JSON with an error field (not HTML)
  it('should return 404 JSON for unknown routes', async () => {
    const response = await request(app).get('/this-route-does-not-exist');

    expect(response.status).toBe(404);
    // Verify it's JSON, not an HTML string
    expect(response.body.error).toBeDefined();
    expect(typeof response.body.error).toBe('string');
  });

});
