const express = require('express');
const router = express.Router();
const { googleLogin, googleLoginWithCode, refreshSession, logout } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { getCsrfToken, validateCsrf } = require('../middleware/csrf');
const { checkBruteForce } = require('../middleware/bruteForce');
const validate = require('../middleware/validate');
const { googleLoginBody, googleAuthCodeBody, refreshBody } = require('../validators/authSchemas');

// All auth routes share the stricter rate limiter (10 req/min/IP)
router.use(authLimiter);

// GET /api/auth/csrf-token — obtain a CSRF token (double-submit cookie pattern)
router.get('/csrf-token', getCsrfToken);

// POST /api/auth/google — exchange Google ID token for session (client-side SDK flow)
// Protected by brute-force lockout (escalating delays per IP)
router.post('/google', validate({ body: googleLoginBody }), checkBruteForce, googleLogin);

// POST /api/auth/google/code — exchange Google auth code for session (server-side flow)
// Preferred for production — ID token is never exposed on the client
router.post('/google/code', validate({ body: googleAuthCodeBody }), checkBruteForce, googleLoginWithCode);

// POST /api/auth/refresh — rotate refresh token, get new access token
// CSRF-protected because it uses cookie-based auth
router.post('/refresh', validate({ body: refreshBody }), validateCsrf, refreshSession);

// POST /api/auth/logout — invalidate refresh token
// CSRF-protected because it uses cookie-based auth
router.post('/logout', authenticate, validateCsrf, logout);

module.exports = router;
