const { OAuth2Client } = require('google-auth-library');
const config = require('../config');

/**
 * @class GoogleAuthError
 * Structured error for Google authentication failures.
 * Every failure mode maps to a machine-readable `code` for the API layer.
 */
class GoogleAuthError extends Error {
  /**
   * @param {string} code    — Machine-readable error code (e.g. 'token_expired')
   * @param {string} message — Human-readable description
   * @param {Error|null} cause — Original error for root-cause tracing
   */
  constructor(code, message, cause = null) {
    super(message);
    this.name = 'GoogleAuthError';
    this.code = code;
    this.cause = cause;
  }
}

/**
 * Return the validated payload to ensure callers only access allowed fields.
 * @param {object} _raw
 * @returns {{ sub: string, email: string, name: string, picture: string, email_verified: boolean, hd: string|null, locale: string|null }}
 */
function validatePayload(_raw) {
  const required = ['sub', 'email'];
  for (const field of required) {
    if (!_raw[field]) {
      throw new GoogleAuthError('payload_invalid', `ID token missing required claim: ${field}`);
    }
  }

  return {
    sub: _raw.sub,
    email: _raw.email,
    name: _raw.name || _raw.email.split('@')[0],
    picture: _raw.picture || '',
    email_verified: _raw.email_verified === true,
    hd: _raw.hd || null,
    locale: _raw.locale || null,
  };
}

/**
 * GoogleAuthService
 *
 * Production-grade server-side Google authentication service.
 *
 * Supports two flows:
 *  1. **ID token verification**  — The client sends the ID token from Google's
 *     sign-in SDK. The server verifies it cryptographically.
 *  2. **Authorization code exchange** — The client sends an auth code from the
 *     Google sign-in redirect. The server exchanges it for tokens server-to-server,
 *     then verifies the resulting ID token. This is MORE SECURE because the ID
 *     token is never exposed to the client.
 *
 * Security guarantees:
 *  - Audience pinning via `verifyIdToken({ audience })` — rejects tokens minted
 *    for other apps
 *  - `email_verified: true` enforcement
 *  - Optional hosted-domain restriction (Google Workspace)
 *  - JWKS caching on the underlying OAuth2Client (handled by google-auth-library)
 *  - Token payload shape validation before any business logic
 *  - Every failure classified with a machine-readable code
 *
 * @singleton — Import the instance, not the class.
 */
class GoogleAuthService {
  constructor() {
    this._client = new OAuth2Client({
      clientId: config.google.clientId,
      clientSecret: config.google.clientSecret,
    });
  }

  // ──────────────────────────────────────────────
  //  Public API
  // ──────────────────────────────────────────────

  /**
   * Verify a Google ID token and return the validated payload.
   *
   * @param {string} idToken — The JWT from Google's sign-in SDK
   * @returns {Promise<object>} Validated payload
   * @throws {GoogleAuthError}
   */
  async verifyIdToken(idToken) {
    this._assertTokenParam(idToken);

    const ticket = await this._verifyWithGoogle(idToken);
    const raw = ticket.getPayload();
    if (!raw) {
      throw new GoogleAuthError('payload_empty', 'ID token payload is empty');
    }

    const payload = validatePayload(raw);

    if (!payload.email_verified) {
      throw new GoogleAuthError('unverified_email', 'Google account email is not verified');
    }

    this._assertHostedDomain(payload.hd);

    return payload;
  }

  /**
   * Exchange an authorization code for tokens server-to-server, then verify
   * the resulting ID token.
   *
   * Preferred flow for production because the ID token is never visible on the
   * client side, eliminating token interception via XSS.
   *
   * @param {string} authCode — The authorization code from Google's redirect
   * @returns {Promise<{payload: object, googleAccessToken: string|null, googleRefreshToken: string|null}>}
   * @throws {GoogleAuthError}
   */
  async exchangeAuthCode(authCode) {
    if (!authCode || typeof authCode !== 'string' || authCode.length < 10) {
      throw new GoogleAuthError('invalid_auth_code', 'Authorization code must be a valid string');
    }

    if (!config.google.clientSecret) {
      throw new GoogleAuthError(
        'misconfigured',
        'GOOGLE_CLIENT_SECRET is required for the authorization code flow'
      );
    }

    const tokens = await this._exchangeCode(authCode);

    if (!tokens.id_token) {
      throw new GoogleAuthError('code_exchange_failed', 'No ID token in the token response');
    }

    // Verify the token that was just issued server-to-server
    const payload = await this.verifyIdToken(tokens.id_token);

    return {
      payload,
      googleAccessToken: tokens.access_token || null,
      googleRefreshToken: tokens.refresh_token || null,
    };
  }

  // ──────────────────────────────────────────────
  //  Internal helpers
  // ──────────────────────────────────────────────

  /**
   * Thin wrapper around google-auth-library's verifyIdToken with
   * all error modes mapped to structured GoogleAuthError codes.
   */
  async _verifyWithGoogle(idToken) {
    try {
      return await this._client.verifyIdToken({
        idToken,
        audience: config.google.clientId,
      });
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('used too late') || msg.includes('Token expired')) {
        throw new GoogleAuthError('token_expired', 'ID token has expired', err);
      }
      if (msg.includes('Invalid token') || msg.includes('Wrong number of segments')) {
        throw new GoogleAuthError('invalid_token', 'ID token is malformed', err);
      }
      if (msg.includes('audience') || msg.toLowerCase().includes('aud')) {
        throw new GoogleAuthError('audience_mismatch', 'ID token audience does not match this application', err);
      }
      throw new GoogleAuthError('verification_failed', 'ID token verification failed', err);
    }
  }

  /**
   * Exchange the Google authorization code for access/refresh/ID tokens.
   */
  async _exchangeCode(authCode) {
    try {
      const { tokens } = await this._client.getToken({
        code: authCode,
        redirect_uri: config.google.redirectUri,
      });
      return tokens;
    } catch (err) {
      throw new GoogleAuthError('code_exchange_failed', 'Failed to exchange authorization code for tokens', err);
    }
  }

  _assertTokenParam(idToken) {
    if (!idToken || typeof idToken !== 'string') {
      throw new GoogleAuthError('invalid_token', 'ID token must be a non-empty string');
    }
  }

  /**
   * If a hosted domain is configured, reject users outside that domain.
   * Useful for enterprise/workspace-only applications.
   */
  _assertHostedDomain(hd) {
    if (config.google.hostedDomain && hd !== config.google.hostedDomain) {
      throw new GoogleAuthError(
        'domain_mismatch',
        `Sign-in is restricted to the ${config.google.hostedDomain} domain`
      );
    }
  }
}

module.exports = { GoogleAuthService, GoogleAuthError };
