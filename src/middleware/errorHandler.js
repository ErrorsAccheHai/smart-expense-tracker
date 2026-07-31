// Central error handler — catches anything passed via next(error) from any controller
//
// IMPORTANT: Express identifies this as an error handler because it has EXACTLY
// four parameters (err, req, res, next). If you remove any one of them,
// Express will treat it as regular middleware and errors will not route here.
//
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Always log the full error on the server side
  // This gives developers the real stack trace for debugging
  // We use console.error so it goes to stderr, separate from normal logs
  console.error(`[ERROR] ${req.method} ${req.originalUrl}`);
  console.error(err.stack || err.message || err);

  // Determine the status code to send to the client
  // If the error object carries a statusCode (set deliberately), use it
  // Otherwise fall back to 500 Internal Server Error
  // 500 means: "Something went wrong on the server — not the client's fault"
  const statusCode = err.statusCode || 500;

  // Send a clean, safe response — never expose stack traces to the client
  // In production, internal errors should give no implementation details
  res.status(statusCode).json({
    error: statusCode === 500
      ? 'An unexpected error occurred. Please try again later.'
      : err.message,
  });
}

module.exports = errorHandler;
