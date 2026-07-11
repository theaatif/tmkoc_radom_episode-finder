const { nanoid } = require('nanoid');
const jwt = require('jsonwebtoken');
const config = require('../config');
const redis = require('../config/redis');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { recordVisit, getVisitStats } = require('../services/visitService');
const {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  safeCompare,
} = require('../utils/token');
const { GoogleAuthService } = require('../services/GoogleAuthService');
const { incrementAndGetLockout, resetLockout } = require('../middleware/bruteForce');

const googleAuth = new GoogleAuthService();

// Refresh-token TTL in seconds (7 days)
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60;

/**
 * Build cookie options for the refresh token.
 */
const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: config.cookie.secure,
  sameSite: config.cookie.secure ? 'none' : 'lax',
  maxAge: REFRESH_TOKEN_TTL * 1000,
  path: '/api/auth',
  ...(config.cookie.domain ? { domain: config.cookie.domain } : {}),
});

/**
 * Extract the client IP from the request, respecting the trust-proxy setting.
 */
const getClientIp = (req) => req.ip || req.connection?.remoteAddress || 'unknown';

/**
 * Shared helper that finalizes an authenticated Google user session.
 *
 * Steps:
 *  1. Find-or-create the MongoDB user record.
 *  2. Issue an access token (JWT) and an opaque refresh token.
 *  3. Store the hashed refresh token in Redis with a token-family ID for replay detection.
 *  4. Set the refresh token as an httpOnly cookie.
 *  5. Return the access token and user profile to the client.
 *
 * @param {object}  googlePayload — Validated payload from GoogleAuthService
 * @param {string}  ip            — Client IP (for audit logging)
 * @returns {{ accessToken: string, user: object }}
 */
async function createSession(googlePayload, ip) {
  const { sub: googleId, email, name, picture } = googlePayload;

  // Find-or-create the user
  let user = await User.findOne({ googleId });
  if (!user) {
    user = await User.create({
      googleId,
      email,
      name,
      avatarUrl: picture || '',
      shareToken: nanoid(12),
    });
    logger.security('user.created', { userId: user._id.toString(), googleId, email, ip });
  } else {
    // Refresh profile fields from Google (name/picture can change)
    const changed = [];
    if (user.name !== name) { user.name = name; changed.push('name'); }
    if (user.email !== email) { user.email = email; changed.push('email'); }
    if (picture && user.avatarUrl !== picture) { user.avatarUrl = picture; changed.push('avatarUrl'); }
    if (changed.length) {
      await user.save();
      logger.security('user.profile_updated', { userId: user._id.toString(), changed, ip });
    }
  }

  // Issue tokens
  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken();
  const familyId = nanoid(16);
  const hashedRefresh = hashToken(refreshToken);

  // Persist hashed refresh token with family ID (replay detection)
  await redis.set(
    `refresh:${user._id}`,
    JSON.stringify({ hash: hashedRefresh, family: familyId }),
    'EX',
    REFRESH_TOKEN_TTL
  );

  // Reverse index so refresh can be looked up with just the cookie (no access token needed)
  await redis.set(
    `refresh_idx:${hashedRefresh}`,
    user._id.toString(),
    'EX',
    REFRESH_TOKEN_TTL
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      shareToken: user.shareToken,
    },
  };
}

// ──────────────────────────────────────────────
//  Handlers
// ──────────────────────────────────────────────

/**
 * POST /auth/google
 *
 * ID token flow — the client sends the token directly after Google sign-in.
 * The server verifies it cryptographically and creates/updates the user.
 */
const googleLogin = async (req, res, next) => {
  try {
    const ip = getClientIp(req);
    const { idToken } = req.body;

    const googlePayload = await googleAuth.verifyIdToken(idToken);

    // Brute-force counter reset: we only get here if verification succeeded
    await resetLockout(ip);

    const session = await createSession(googlePayload, ip);

    res.cookie('refreshToken', session.refreshToken, getRefreshCookieOptions());

    logger.security('auth.login_success', {
      userId: session.user.id,
      email: googlePayload.email,
      method: 'id_token',
      ip,
    });

    // Record the user visit in background (no-blocking)
    recordVisit(session.user.id, ip, req.headers['user-agent']).catch(() => {});

    res.status(200).json({
      accessToken: session.accessToken,
      user: session.user,
    });
  } catch (err) {
    if (err.name === 'GoogleAuthError') {
      const ip = getClientIp(req);
      await incrementAndGetLockout(ip).catch(() => {});
      logger.security('auth.login_failed', { code: err.code, ip, reason: err.message });
      return next(new ApiError(401, err.code, err.message));
    }
    next(err);
  }
};

/**
 * POST /auth/google/code
 *
 * Authorization code flow (preferred for production).
 * The client sends a one-time Google auth code; the server exchanges it for
 * tokens server-to-server, verifies the resulting ID token, and creates the session.
 *
 * This is MORE SECURE because the ID token is never exposed on the client.
 */
const googleLoginWithCode = async (req, res, next) => {
  try {
    const ip = getClientIp(req);
    const { code } = req.body;

    const { payload: googlePayload } = await googleAuth.exchangeAuthCode(code);

    await resetLockout(ip);

    const session = await createSession(googlePayload, ip);

    res.cookie('refreshToken', session.refreshToken, getRefreshCookieOptions());

    logger.security('auth.login_success', {
      userId: session.user.id,
      email: googlePayload.email,
      method: 'auth_code',
      ip,
    });

    // Record the user visit in background (no-blocking)
    recordVisit(session.user.id, ip, req.headers['user-agent']).catch(() => {});

    res.status(200).json({
      accessToken: session.accessToken,
      user: session.user,
    });
  } catch (err) {
    if (err.name === 'GoogleAuthError') {
      const ip = getClientIp(req);
      await incrementAndGetLockout(ip).catch(() => {});
      logger.security('auth.login_failed', { code: err.code, ip, reason: err.message });
      return next(new ApiError(401, err.code, err.message));
    }
    next(err);
  }
};

/**
 * POST /auth/refresh
 *
 * Rotates the refresh token and returns a new access token.
 *
 * Security features:
 *  - Timing-safe hash comparison prevents side-channel attacks.
 *  - Token-family replay detection: if an old, rotated token is reused, the
 *    entire family is revoked (possible theft indicator).
 *  - Session corruption detection: invalid Redis data triggers forced re-login.
 *  - Client IP is logged for anomaly detection.
 */
const refreshSession = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      throw new ApiError(401, 'refresh_token_invalid_or_expired', 'No refresh token provided');
    }

    if (typeof token !== 'string' || token.length > 200) {
      throw new ApiError(401, 'refresh_token_invalid_or_expired', 'Malformed refresh token');
    }

    const hashedToken = hashToken(token);

    // Lookup userId: try access token first, then fallback to reverse index
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], config.jwt.accessSecret, {
          algorithms: [config.jwt.algorithm],
          issuer: 'tmkoc-api',
          audience: 'tmkoc-client',
          ignoreExpiration: true,
        });
        userId = decoded.userId;
      } catch {
        // Signature invalid — cannot trust this token at all
      }
    }

    // Fallback: look up userId from the refresh token's reverse index
    if (!userId) {
      userId = await redis.get(`refresh_idx:${hashedToken}`);
    }

    if (!userId) {
      throw new ApiError(401, 'refresh_token_invalid_or_expired', 'Cannot identify session');
    }

    const storedRaw = await redis.get(`refresh:${userId}`);
    if (!storedRaw) {
      throw new ApiError(401, 'refresh_token_invalid_or_expired', 'Session has expired');
    }

    let storedData;
    try {
      storedData = JSON.parse(storedRaw);
    } catch {
      await redis.del(`refresh:${userId}`);
      throw new ApiError(401, 'refresh_token_invalid_or_expired', 'Session is corrupted');
    }

    if (!safeCompare(storedData.hash, hashedToken)) {
      // Possible token replay attack — revoke the entire family
      await redis.del(`refresh:${userId}`);
      await redis.del(`refresh_idx:${hashedToken}`);
      const ip = getClientIp(req);
      logger.security('token.replay_attack', { userId, ip, family: storedData.family });
      throw new ApiError(401, 'refresh_token_invalid_or_expired', 'Refresh token has been revoked');
    }

    // Rotate: issue new tokens with the same family
    const newAccessToken = generateAccessToken(userId);
    const newRefreshToken = generateRefreshToken();
    const newHashedRefresh = hashToken(newRefreshToken);

    // Delete old reverse index before rotating
    await redis.del(`refresh_idx:${hashedToken}`);

    await redis.set(
      `refresh:${userId}`,
      JSON.stringify({ hash: newHashedRefresh, family: storedData.family }),
      'EX',
      REFRESH_TOKEN_TTL
    );

    // Set new reverse index
    await redis.set(
      `refresh_idx:${newHashedRefresh}`,
      userId,
      'EX',
      REFRESH_TOKEN_TTL
    );

    res.cookie('refreshToken', newRefreshToken, getRefreshCookieOptions());

    // Fetch fresh user data for the client
    const user = await User.findById(userId).lean();
    if (!user) {
      throw new ApiError(401, 'refresh_token_invalid_or_expired', 'User not found');
    }

    logger.info('auth.token_refreshed', { userId, ip: getClientIp(req) });

    // Record the user visit in background (no-blocking)
    recordVisit(userId, getClientIp(req), req.headers['user-agent']).catch(() => {});

    res.status(200).json({
      accessToken: newAccessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        shareToken: user.shareToken,
      },
    });
  } catch (err) {
    if (err.name === 'ApiError') return next(err);
    next(err);
  }
};

/**
 * POST /auth/logout
 *
 * Invalidates the refresh token and clears the cookie.
 */
const logout = async (req, res, next) => {
  try {
    if (req.userId) {
      await redis.del(`refresh:${req.userId}`);
      // Also clean reverse index if we have the refresh token cookie
      const token = req.cookies?.refreshToken;
      if (token && typeof token === 'string' && token.length <= 200) {
        const hashedToken = hashToken(token);
        await redis.del(`refresh_idx:${hashedToken}`);
      }
      logger.security('auth.logout', { userId: req.userId, ip: getClientIp(req) });
    }

    res.clearCookie('refreshToken', {
      path: '/api/auth',
      httpOnly: true,
      secure: config.cookie.secure,
      sameSite: 'strict',
    });
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /auth/visits
 *
 * Fetch platform user visit statistics (frequent visitors & recent visits).
 */
const getVisits = async (req, res, next) => {
  try {
    const stats = await getVisitStats();
    res.status(200).json(stats);
  } catch (err) {
    next(err);
  }
};

module.exports = { googleLogin, googleLoginWithCode, refreshSession, logout, getVisits };

