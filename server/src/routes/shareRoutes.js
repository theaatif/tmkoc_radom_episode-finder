const express = require('express');
const router = express.Router();
const { getSharedFavorites } = require('../controllers/favoriteController');
const validate = require('../middleware/validate');
const { shareParams, shareQuery } = require('../validators/favoriteSchemas');

// GET /api/share/:shareToken — public, no auth required (paginated)
router.get(
  '/:shareToken',
  validate({ params: shareParams, query: shareQuery }),
  getSharedFavorites
);

module.exports = router;
