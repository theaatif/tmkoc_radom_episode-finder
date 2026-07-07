/**
 * Centralized configuration — reads from process.env (loaded by dotenv in server.js).
 * Every config value the app needs is exported from here so nothing else touches
 * process.env directly.
 *
 * All values have sensible defaults for development. Production deployments MUST
 * override everything via environment variables.
 */

const config = {
  // ── Server ──
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  get isDev() {
    return this.nodeEnv === 'development';
  },
  get isProd() {
    return this.nodeEnv === 'production';
  },

  // ── Logging ──
  logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),

  // ── MongoDB ──
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tmkoc',

  // ── Redis ──
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD || undefined,
  },

  // ── JWT ──
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    // Pin the algorithm to prevent algorithm-confusion attacks (e.g. "none", RS→HS)
    algorithm: 'HS256',
  },

  // ── Google OAuth ──
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // Redirect URI for the authorization code flow.
    // Must match EXACTLY what's registered in Google Cloud Console.
    redirectUri: process.env.GOOGLE_REDIRECT_URI || `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/callback`,
    // If set, only users from this Google Workspace domain can sign in.
    hostedDomain: process.env.GOOGLE_HOSTED_DOMAIN || undefined,
  },

  // ── CORS ──
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

  // ── Cookie ──
  cookie: {
    // In production this MUST be true (HTTPS only). In dev, allow insecure for localhost.
    secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
    // Domain restriction — if set, cookies are scoped to this domain
    domain: process.env.COOKIE_DOMAIN || undefined,
  },

  // ── Request limits ──
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT_MS, 10) || 30000,
};

module.exports = config;
