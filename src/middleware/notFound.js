// This middleware is registered AFTER all real routes in app.js
// If a request reaches this point, no route matched it
// Express only runs this if none of the routes above sent a response

// Note: this is a standard 3-argument middleware, not an error handler
// It handles the case of "route not found", not a thrown error
function notFound(req, res, next) {
  // 404 Not Found — the URL the client requested doesn't exist on this server
  // We include the attempted path so the client knows exactly what wasn't found
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = notFound;
