const crypto = require('crypto');
const config = require('../config');

/**
 * CSRF protection via double-submit cookie pattern.
 *
 * Strategy:
 *  1. GET /api/auth/csrf-token returns a CSRF cookie (non-httpOnly, JS-readable).
 *  2. Client reads the cookie and sends its value as X-CSRF-Token header.
 *  3. Middleware verifies header === cookie (timing-safe).
 *
 * This covers subdomain-based CSRF attacks that SameSite=Strict doesn't fully prevent.
 * No server-side state needed.
 */

const CSRF_COOKIE_NAME = 'csrfToken';

/**
 * GET handler — sets a CSRF cookie and returns it in the response body.
 * The cookie is NOT httpOnly so the client-side JS can read it.
 */
const getCsrfToken = (_req, res) => {
  const token = crypto.randomBytes(32).toString('hex');

  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false,   // client-side JS needs to read this
    secure: config.cookie.secure,
    sameSite: 'strict',
    maxAge: 60 * 60 * 1000, // 1 hour
    path: '/',
  });

  res.json({ csrfToken: token });
};

/**
 * Middleware — validates that the X-CSRF-Token header matches the csrfToken cookie.
 * Apply to state-changing endpoints that rely on cookie-based auth (refresh, logout).
 */
const validateCsrf = (req, res, next) => {
  const headerToken = req.headers['x-csrf-token'];
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];

  if (!headerToken || !cookieToken) {
    return res.status(403).json({
      error: { code: 'csrf_missing', message: 'Missing CSRF token' },
    });
  }

  // Timing-safe comparison
  if (headerToken.length !== cookieToken.length) {
    return res.status(403).json({
      error: { code: 'csrf_invalid', message: 'CSRF token mismatch' },
    });
  }

  try {
    const valid = crypto.timingSafeEqual(
      Buffer.from(headerToken),
      Buffer.from(cookieToken)
    );

    if (!valid) {
      return res.status(403).json({
        error: { code: 'csrf_invalid', message: 'CSRF token mismatch' },
      });
    }
  } catch {
    return res.status(403).json({
      error: { code: 'csrf_invalid', message: 'CSRF token mismatch' },
    });
  }

  next();
};

module.exports = { getCsrfToken, validateCsrf, CSRF_COOKIE_NAME };
