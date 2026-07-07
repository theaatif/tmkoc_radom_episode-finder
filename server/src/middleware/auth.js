const { verifyAccessToken } = require('../utils/token');

/**
 * Middleware: verifies the Bearer access token on protected routes.
 * Uses pinned algorithm verification to prevent algorithm confusion.
 * On success, attaches `req.userId` for downstream handlers.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: { code: 'unauthorized', message: 'Missing or invalid authorization header' },
    });
  }

  const token = authHeader.split(' ')[1];

  // Guard against absurdly long tokens (possible DoS via slow JWT parsing)
  if (token.length > 2048) {
    return res.status(401).json({
      error: { code: 'unauthorized', message: 'Malformed token' },
    });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Access token has expired'
        : 'Access token is invalid';

    return res.status(401).json({
      error: { code: 'unauthorized', message },
    });
  }
};

/**
 * Middleware: optionally attaches `req.userId` if a valid token is present,
 * but does NOT block the request if the token is missing or invalid.
 */
const optionalAuth = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token.length <= 2048) {
      try {
        const decoded = verifyAccessToken(token);
        req.userId = decoded.userId;
      } catch {
        // Token invalid — proceed unauthenticated
      }
    }
  }

  next();
};

module.exports = { authenticate, optionalAuth };
