const express = require('express');
const router = express.Router();
const { getSharedFavorites, createSharedPlaylist } = require('../controllers/favoriteController');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { shareLimiter, generalLimiter } = require('../middleware/rateLimiter');
const { shareParams, shareQuery, createShareBody } = require('../validators/favoriteSchemas');

// POST /api/share — auth required, snapshots current favorites
router.post(
  '/',
  authenticate,
  shareLimiter,
  validate({ body: createShareBody }),
  createSharedPlaylist
);

// GET /api/share/:id — public, no auth required (paginated)
// Supports both snapshot playlistId and user shareToken
router.get(
  '/:id',
  generalLimiter,
  validate({ params: shareParams, query: shareQuery }),
  getSharedFavorites
);

module.exports = router;
