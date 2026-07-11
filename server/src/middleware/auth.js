const { verifyAccessToken } = require('../utils/token');
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');
const { incrementAndGetLockout, resetLockout } = require('./bruteForce');

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

/**
 * Middleware: verifies Basic Auth credentials for admin access.
 * Reads ADMIN_USERNAME and ADMIN_PASSWORD_HASH from environment variables.
 * Password hash is bcrypt-generated. No credentials are stored in source code.
 * Integrates brute-force lockout: increments on failure, resets on success.
 */
const adminAuthenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({
      error: { code: 'unauthorized', message: 'Admin authentication required' },
    });
  }

  const token = authHeader.split(' ')[1];
  let decoded;
  try {
    decoded = Buffer.from(token, 'base64').toString('utf8');
  } catch {
    return res.status(401).json({
      error: { code: 'unauthorized', message: 'Malformed credentials' },
    });
  }

  const colonIndex = decoded.indexOf(':');
  if (colonIndex === -1) {
    return res.status(401).json({
      error: { code: 'unauthorized', message: 'Invalid admin credentials' },
    });
  }

  const username = decoded.substring(0, colonIndex);
  const password = decoded.substring(colonIndex + 1);

  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!expectedUsername || !expectedPasswordHash) {
    logger.error('adminAuthenticate: ADMIN_USERNAME or ADMIN_PASSWORD_HASH not configured');
    return res.status(500).json({
      error: { code: 'config_error', message: 'Admin auth not configured' },
    });
  }

  if (!timingSafeEqual(username, expectedUsername)) {
    const lockout = await incrementAndGetLockout(req.ip);
    const body = { error: { code: 'unauthorized', message: 'Invalid admin credentials' } };
    if (lockout > 0) {
      body.error.lockedSeconds = lockout;
      body.error.message += ` Account locked for ${Math.ceil(lockout / 60)} minute(s).`;
    }
    return res.status(401).json(body);
  }

  try {
    const match = await bcrypt.compare(password, expectedPasswordHash);
    if (match) {
      await resetLockout(req.ip);
      return next();
    }
    const lockout = await incrementAndGetLockout(req.ip);
    const body = { error: { code: 'unauthorized', message: 'Invalid admin credentials' } };
    if (lockout > 0) {
      body.error.lockedSeconds = lockout;
      body.error.message += ` Account locked for ${Math.ceil(lockout / 60)} minute(s).`;
    }
    return res.status(401).json(body);
  } catch (err) {
    logger.error('adminAuthenticate: bcrypt.compare failed', { error: err.message });
    return res.status(500).json({
      error: { code: 'internal', message: 'Authentication error' },
    });
  }
};

/**
 * Timing-safe string comparison to prevent timing side-channels.
 * Uses constant-time buffer comparison for username equality checks.
 */
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return require('crypto').timingSafeEqual(bufA, bufB);
}

module.exports = { authenticate, optionalAuth, adminAuthenticate };
