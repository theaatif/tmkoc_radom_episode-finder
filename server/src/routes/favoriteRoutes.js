const express = require('express');
const router = express.Router();
const {
  addFavorite,
  removeFavorite,
  getFavorites,
} = require('../controllers/favoriteController');
const { authenticate } = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const { favoriteParams, favoritesQuery } = require('../validators/favoriteSchemas');

// GET /api/favorites — list current user's favorites (paginated)
router.get(
  '/',
  authenticate,
  generalLimiter,
  validate({ query: favoritesQuery }),
  getFavorites
);

// POST /api/favorites/:episodeId — add to favorites
router.post(
  '/:episodeId',
  authenticate,
  generalLimiter,
  validate({ params: favoriteParams }),
  addFavorite
);

// DELETE /api/favorites/:episodeId — remove from favorites
router.delete(
  '/:episodeId',
  authenticate,
  generalLimiter,
  validate({ params: favoriteParams }),
  removeFavorite
);

module.exports = router;
