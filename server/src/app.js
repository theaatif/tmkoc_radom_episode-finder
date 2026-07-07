const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const config = require('./config');
const errorHandler = require('./middleware/errorHandler');

// Route modules
const authRoutes = require('./routes/authRoutes');
const episodeRoutes = require('./routes/episodeRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const shareRoutes = require('./routes/shareRoutes');

const app = express();

// ──────────────────────────────────────────────
// Trust proxy (required behind load balancers / reverse proxies)
// ──────────────────────────────────────────────
if (config.isProd) {
  app.set('trust proxy', 1);
}

// ──────────────────────────────────────────────
// Request ID for tracing (production debugging)
// ──────────────────────────────────────────────
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// ──────────────────────────────────────────────
// Request timeout — kill slow/hanging requests
// ──────────────────────────────────────────────
app.use((req, res, next) => {
  req.setTimeout(config.requestTimeout, () => {
    if (!res.headersSent) {
      res.status(408).json({
        error: { code: 'request_timeout', message: 'Request timed out' },
      });
    }
  });
  next();
});

// ──────────────────────────────────────────────
// Security headers (hardened helmet)
// ──────────────────────────────────────────────
app.use(
  helmet({
    // Content Security Policy — API-only server, block everything
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    // Strict Transport Security — force HTTPS for 1 year, include subdomains
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    // Prevent MIME sniffing
    noSniff: true,
    // Prevent clickjacking
    frameguard: { action: 'deny' },
    // Hide X-Powered-By
    hidePoweredBy: true,
    // Referrer policy — no referrer leakage
    referrerPolicy: { policy: 'no-referrer' },
    // Cross-Origin policies
    crossOriginEmbedderPolicy: false, // disable for API (breaks some fetch modes)
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-origin' },
  })
);

// ──────────────────────────────────────────────
// Additional security headers not covered by helmet
// ──────────────────────────────────────────────
app.use((_req, res, next) => {
  // Prevent caching of API responses containing user data
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  // Permissions Policy — disable all browser features (API server doesn't need them)
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  next();
});

// ──────────────────────────────────────────────
// CORS — strict allow-list (no wildcards)
// ──────────────────────────────────────────────
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID', 'RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
    maxAge: 86400, // Cache preflight for 24 hours
  })
);

// ──────────────────────────────────────────────
// Body parsing with strict limits
// ──────────────────────────────────────────────
app.use(express.json({ limit: '10kb', strict: true }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ──────────────────────────────────────────────
// Cookie parsing (for refresh token)
// ──────────────────────────────────────────────
app.use(cookieParser());

// ──────────────────────────────────────────────
// Protect against HTTP parameter pollution
// ──────────────────────────────────────────────
app.use(hpp());

// ──────────────────────────────────────────────
// Sanitize user input against NoSQL injection
// replaceWith replaces prohibited chars instead of stripping them,
// which is more secure as it preserves string length (prevents bypass)
// ──────────────────────────────────────────────
app.use(
  mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      console.warn(`[SECURITY] Sanitized ${key} in ${req.method} ${req.originalUrl}`);
    },
  })
);

// ──────────────────────────────────────────────
// Request logging
// ──────────────────────────────────────────────
if (config.isDev) {
  app.use(morgan('dev'));
} else {
  // Include request ID in production logs for tracing
  morgan.token('request-id', (req) => req.id);
  app.use(
    morgan(':request-id :remote-addr :method :url :status :res[content-length] - :response-time ms')
  );
}

// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/episodes', episodeRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/share', shareRoutes);

// ──────────────────────────────────────────────
// 404 catch-all
// ──────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    error: { code: 'not_found', message: 'Route not found' },
  });
});

// ──────────────────────────────────────────────
// Centralized error handler (must be last)
// ──────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
