const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');

/**
 * Generate a short-lived access token (JWT).
 * Algorithm is pinned to HS256 to prevent algorithm-confusion attacks.
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, config.jwt.accessSecret, {
    algorithm: config.jwt.algorithm,
    expiresIn: config.jwt.accessExpiresIn,
    issuer: 'tmkoc-api',
    audience: 'tmkoc-client',
  });
};

/**
 * Verify an access token with strict options.
 * Pinned algorithm prevents "none" and RS↔HS confusion attacks.
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, config.jwt.accessSecret, {
    algorithms: [config.jwt.algorithm],
    issuer: 'tmkoc-api',
    audience: 'tmkoc-client',
  });
};

/**
 * Generate an opaque refresh token (random bytes, not a JWT).
 * 40 bytes = 80 hex chars = 320 bits of entropy.
 */
const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

/**
 * Hash a refresh token before storing it in Redis.
 * SHA-256 is a one-way hash — even if Redis is compromised,
 * the raw token cannot be recovered.
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Constant-time comparison to prevent timing attacks on token verification.
 */
const safeCompare = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
};

module.exports = {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashToken,
  safeCompare,
};
