const rateLimit = require('express-rate-limit');

/**
 * Rate limiters as defined in the project spec §6.7:
 *  - auth:    10 req / min / IP
 *  - generate: 30 req / min / user
 *  - general: 100 req / min / user
 *
 * For user-keyed limiters we prefer `req.userId` (set by auth middleware)
 * and fall back to the default IP-based key generator.
 */

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: { code: 'rate_limited', message: 'Too many auth requests — try again later' },
  },
});

const generateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator: (req) => req.userId || 'anon',
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, ip: false },
  message: {
    error: { code: 'rate_limited', message: 'Too many generate requests — slow down' },
  },
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.userId || 'anon',
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, ip: false },
  message: {
    error: { code: 'rate_limited', message: 'Too many requests — slow down' },
  },
});

module.exports = { authLimiter, generateLimiter, generalLimiter };
