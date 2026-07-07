const express = require('express');
const router = express.Router();
const { googleLogin, refreshSession, logout } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const { googleLoginBody } = require('../validators/authSchemas');

// All auth routes share the stricter rate limiter (10 req/min/IP)
router.use(authLimiter);

// POST /api/auth/google — exchange Google ID token for session
router.post('/google', validate({ body: googleLoginBody }), googleLogin);

// POST /api/auth/refresh — rotate refresh token, get new access token
router.post('/refresh', refreshSession);

// POST /api/auth/logout — invalidate refresh token
router.post('/logout', authenticate, logout);

module.exports = router;
