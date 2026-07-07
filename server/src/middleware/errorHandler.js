const config = require('../config');

/**
 * Centralized error handler — always returns the standard error envelope.
 *
 * Production hardening:
 *  - Stack traces are NEVER sent to clients
 *  - Internal error messages are replaced with a generic message in production
 *  - Mongoose validation errors are mapped to 400
 *  - Duplicate key errors are mapped to 409
 *  - All errors are logged with request ID for tracing
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  // Prevent double-sending if headers already sent
  if (res.headersSent) {
    return;
  }

  let statusCode = err.statusCode || 500;
  let code = err.code || 'internal_error';
  let message = err.message || 'An internal error occurred';

  // ── Map Mongoose validation errors ──
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    code = 'validation_error';
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join('; ');
  }

  // ── Map MongoDB duplicate key errors ──
  if (err.code === 11000 || err.name === 'MongoServerError' && err.code === 11000) {
    statusCode = 409;
    code = 'duplicate_resource';
    message = 'Resource already exists';
  }

  // ── Map JSON parse errors ──
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    code = 'validation_error';
    message = 'Malformed JSON in request body';
  }

  // ── Map payload too large ──
  if (err.type === 'entity.too.large') {
    statusCode = 413;
    code = 'payload_too_large';
    message = 'Request body exceeds the allowed size';
  }

  // ── Structured logging ──
  const logEntry = {
    requestId: req.id || 'unknown',
    method: req.method,
    url: req.originalUrl,
    statusCode,
    code,
    message: err.message,
    ...(config.isDev ? { stack: err.stack } : {}),
  };

  if (statusCode >= 500) {
    console.error('[ERROR]', JSON.stringify(logEntry));
  } else {
    console.warn('[WARN]', JSON.stringify(logEntry));
  }

  // ── Response — NEVER leak internal details in production ──
  res.status(statusCode).json({
    error: {
      code,
      message:
        config.isProd && statusCode >= 500
          ? 'An internal error occurred'
          : message,
      ...(req.id ? { requestId: req.id } : {}),
    },
  });
};

module.exports = errorHandler;
