const redis = require('../config/redis');

/**
 * Brute-force lockout via escalating delays per IP.
 *
 * Lockout tiers (per IP):
 *   Attempts  1-4   → no lockout
 *   Attempts  5-9   → 1 minute lockout
 *   Attempts 10-19  → 5 minute lockout
 *   Attempts 20-49  → 15 minute lockout
 *   Attempts 50+    → 1 hour lockout
 *
 * Counter resets after a successful login.
 */

const LOCKOUT_TIERS = [
  { threshold: 50, ttl: 3600 },   // 1 hour
  { threshold: 20, ttl: 900 },    // 15 minutes
  { threshold: 10, ttl: 300 },    // 5 minutes
  { threshold: 5, ttl: 60 },      // 1 minute
];

const FAIL_PREFIX = 'authfail:';

/**
 * Increment the failed-attempt counter for an IP and return
 * the remaining lockout seconds (0 = not locked out).
 */
const incrementAndGetLockout = async (ip) => {
  const key = `${FAIL_PREFIX}${ip}`;
  const attempts = await redis.incr(key);

  // Set TTL on first increment so the key auto-expires
  if (attempts === 1) {
    // Base TTL: 1 hour after last attempt
    await redis.expire(key, 3600);
  }

  // Find the matching lockout tier
  for (const tier of LOCKOUT_TIERS) {
    if (attempts >= tier.threshold) {
      // Refresh the key TTL to the lockout duration
      const remaining = await redis.ttl(key);
      // Ensure lockout lasts at least the tier's TTL
      if (remaining < tier.ttl) {
        await redis.expire(key, tier.ttl);
      }
      return Math.max(remaining, tier.ttl);
    }
  }

  return 0;
};

/**
 * Reset the failed-attempt counter for an IP (on successful login).
 */
const resetLockout = async (ip) => {
  await redis.del(`${FAIL_PREFIX}${ip}`);
};

/**
 * Express middleware: checks lockout status before processing auth requests.
 * Must be placed AFTER rate limiting but BEFORE auth controller logic.
 * In production, use req.ip (trust proxy must be enabled).
 */
const checkBruteForce = async (req, res, next) => {
  // Use X-Forwarded-For IP in production, connection IP otherwise
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';

  const key = `${FAIL_PREFIX}${ip}`;
  const remaining = await redis.ttl(key);
  const exists = remaining > 0;

  if (exists) {
    const attempts = parseInt(await redis.get(key), 10) || 0;
    // Check against lockout tiers
    for (const tier of LOCKOUT_TIERS) {
      if (attempts >= tier.threshold) {
        return res.status(429).json({
          error: {
            code: 'account_locked',
            message: `Too many failed attempts. Try again in ${Math.ceil(remaining / 60)} minute(s).`,
            retryAfterSeconds: remaining,
          },
        });
      }
    }
  }

  next();
};

module.exports = { incrementAndGetLockout, resetLockout, checkBruteForce };
