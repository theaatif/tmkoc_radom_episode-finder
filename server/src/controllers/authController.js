const { OAuth2Client } = require('google-auth-library');
const { nanoid } = require('nanoid');
const jwt = require('jsonwebtoken');
const config = require('../config');
const redis = require('../config/redis');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  safeCompare,
} = require('../utils/token');

const googleClient = new OAuth2Client(config.google.clientId);

// Refresh-token TTL in seconds (7 days)
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60;

/**
 * Build cookie options for the refresh token.
 * Centralized so every path sets identical flags.
 */
const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: config.cookie.secure,
  sameSite: 'strict',
  maxAge: REFRESH_TOKEN_TTL * 1000,
  path: '/api/auth',
  ...(config.cookie.domain ? { domain: config.cookie.domain } : {}),
});

/**
 * POST /auth/google
 * Exchange a Google ID token for an application session.
 */
const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    // idToken presence and type are guaranteed by Zod validation middleware

    // 1. Verify the Google ID token (signature + aud + iss)
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: config.google.clientId,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      throw new ApiError(401, 'invalid_token', 'Google ID token verification failed');
    }

    if (!payload) {
      throw new ApiError(401, 'invalid_token', 'Google ID token payload is empty');
    }

    // 2. Reject unverified email addresses
    if (!payload.email_verified) {
      throw new ApiError(401, 'invalid_token', 'Google account email is not verified');
    }

    const { sub: googleId, email, name, picture } = payload;

    // 3. Find-or-create the user
    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.create({
        googleId,
        email,
        name,
        avatarUrl: picture || '',
        shareToken: nanoid(12),
      });
    } else {
      // Update profile fields that may have changed on Google's side
      user.name = name;
      user.email = email;
      user.avatarUrl = picture || user.avatarUrl;
      await user.save();
    }

    // 4. Issue application tokens
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken();

    // 5. Store hashed refresh token in Redis with a token family ID.
    //    The family ID allows detecting token reuse (replay attacks).
    const familyId = nanoid(16);
    const hashedRefresh = hashToken(refreshToken);
    await redis.set(
      `refresh:${user._id}`,
      JSON.stringify({ hash: hashedRefresh, family: familyId }),
      'EX',
      REFRESH_TOKEN_TTL
    );

    // 6. Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());

    res.status(200).json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err) {
    if (err.name === 'ApiError') return next(err);
    // Catch any other Google auth library errors
    if (
      err.message?.includes('Token used too late') ||
      err.message?.includes('Invalid token') ||
      err.message?.includes('Wrong number of segments')
    ) {
      return next(new ApiError(401, 'invalid_token', 'Google ID token is invalid or expired'));
    }
    next(err);
  }
};

/**
 * POST /auth/refresh
 * Rotates the refresh token and returns a new access token.
 *
 * Security: uses timing-safe hash comparison and token-family-based
 * replay detection. If a refresh token is reused (possible theft),
 * the entire family is revoked.
 */
const refreshSession = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      throw new ApiError(401, 'refresh_token_invalid_or_expired', 'No refresh token provided');
    }

    // Guard against absurdly long cookie values
    if (typeof token !== 'string' || token.length > 200) {
      throw new ApiError(401, 'refresh_token_invalid_or_expired', 'Malformed refresh token');
    }

    const hashedToken = hashToken(token);

    // Extract userId from the (potentially expired) access token.
    // The access token's signature is still verified — only expiration is ignored.
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

    if (!userId) {
      throw new ApiError(401, 'refresh_token_invalid_or_expired', 'Cannot identify session');
    }

    // Retrieve stored token data
    const storedRaw = await redis.get(`refresh:${userId}`);
    if (!storedRaw) {
      throw new ApiError(401, 'refresh_token_invalid_or_expired', 'Session has expired');
    }

    let storedData;
    try {
      storedData = JSON.parse(storedRaw);
    } catch {
      // Corrupted data — force re-login
      await redis.del(`refresh:${userId}`);
      throw new ApiError(401, 'refresh_token_invalid_or_expired', 'Session is corrupted');
    }

    // Timing-safe comparison to prevent timing attacks
    if (!safeCompare(storedData.hash, hashedToken)) {
      // Possible token replay attack — revoke the entire family
      await redis.del(`refresh:${userId}`);
      console.warn(
        `[SECURITY] Refresh token reuse detected for userId=${userId}. Family revoked.`
      );
      throw new ApiError(401, 'refresh_token_invalid_or_expired', 'Refresh token has been revoked');
    }

    // Rotate: issue new tokens with same family
    const newAccessToken = generateAccessToken(userId);
    const newRefreshToken = generateRefreshToken();
    const newHashedRefresh = hashToken(newRefreshToken);

    await redis.set(
      `refresh:${userId}`,
      JSON.stringify({ hash: newHashedRefresh, family: storedData.family }),
      'EX',
      REFRESH_TOKEN_TTL
    );

    res.cookie('refreshToken', newRefreshToken, getRefreshCookieOptions());
    res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    if (err.name === 'ApiError') return next(err);
    next(err);
  }
};

/**
 * POST /auth/logout
 * Invalidates the refresh token and clears the cookie.
 */
const logout = async (req, res, next) => {
  try {
    if (req.userId) {
      await redis.del(`refresh:${req.userId}`);
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

module.exports = { googleLogin, refreshSession, logout };
