const express = require('express');
const router = express.Router();
const { generateEpisodes, markWatched, getHistory } = require('../controllers/episodeController');
const { authenticate } = require('../middleware/auth');
const { generateLimiter, generalLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const { generateQuery, watchParams, historyQuery } = require('../validators/episodeSchemas');

// GET /api/episodes/generate — get batch of unwatched episodes
router.get(
  '/generate',
  authenticate,
  generateLimiter,
  validate({ query: generateQuery }),
  generateEpisodes
);

// POST /api/episodes/:id/watch — mark episode as watched
router.post(
  '/:id/watch',
  authenticate,
  generalLimiter,
  validate({ params: watchParams }),
  markWatched
);

// GET /api/episodes/history — user's watch history (paginated)
router.get(
  '/history',
  authenticate,
  generalLimiter,
  validate({ query: historyQuery }),
  getHistory
);

module.exports = router;
