// Import the configured Express app
const app = require('./src/app');

// Define which port the server listens on
// process.env.PORT allows this to be configured in production environments
// The || 3000 is the fallback for local development
const PORT = process.env.PORT || 3000;

// Start the server and begin listening for incoming HTTP requests
app.listen(PORT, () => {
  console.log(`Smart Expense Tracker API running on http://localhost:${PORT}`);
});
