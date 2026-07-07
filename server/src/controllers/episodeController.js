const mongoose = require('mongoose');
const { Episode, WatchHistory } = require('../models');
const ApiError = require('../utils/ApiError');

// Maximum episodes per generated batch
const BATCH_SIZE = 4;

// Pagination defaults and limits
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * GET /episodes/generate?genre={optional}
 * Returns up to 4 random episodes the user has NOT yet watched.
 * Server-authoritative randomness — the exclusion runs in MongoDB's aggregation pipeline.
 */
const generateEpisodes = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const { genre } = req.query;

    // Get IDs the user has already watched
    const watchedDocs = await WatchHistory.find({ userId }).select('episodeId').lean();
    const watchedIds = watchedDocs.map((w) => w.episodeId);

    // Build match stage
    const matchStage = { _id: { $nin: watchedIds } };
    if (genre) {
      matchStage.genre = genre;
    }

    // Count remaining unwatched episodes
    const remaining = await Episode.countDocuments(matchStage);

    if (remaining === 0) {
      return res.status(200).json({ done: true, episodes: [], remaining: 0 });
    }

    // Pick up to BATCH_SIZE random unwatched episodes
    const episodes = await Episode.aggregate([
      { $match: matchStage },
      { $sample: { size: BATCH_SIZE } },
      {
        $project: {
          _id: 0,
          id: '$_id',
          title: 1,
          genre: 1,
          thumbnailUrl: 1,
          youtubeVideoId: 1,
        },
      },
    ]);

    res.status(200).json({ episodes, remaining: remaining - episodes.length });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /episodes/:id/watch
 * Logs an episode as watched for the current user (idempotent via compound unique index).
 */
const markWatched = async (req, res, next) => {
  try {
    const { id } = req.params;
    // id format is guaranteed by Zod validation middleware

    // Verify the episode exists
    const episode = await Episode.findById(id).lean();
    if (!episode) {
      throw ApiError.notFound('Episode not found');
    }

    // Upsert — if it already exists, that's fine (idempotent)
    await WatchHistory.findOneAndUpdate(
      { userId: req.userId, episodeId: id },
      { userId: req.userId, episodeId: id, watchedAt: new Date() },
      { upsert: true, new: true }
    );

    res.sendStatus(204);
  } catch (err) {
    if (err.name === 'ApiError') return next(err);
    next(err);
  }
};

/**
 * GET /episodes/history?page=1&limit=20
 * Returns the current user's watch history, most recent first.
 * Paginated to prevent unbounded queries (DoS vector).
 */
const getHistory = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || DEFAULT_PAGE);
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT));
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      WatchHistory.find({ userId: req.userId })
        .sort({ watchedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('episodeId', 'title genre thumbnailUrl youtubeVideoId')
        .lean(),
      WatchHistory.countDocuments({ userId: req.userId }),
    ]);

    const episodes = history
      .filter((h) => h.episodeId) // guard against deleted episodes
      .map((h) => ({
        id: h.episodeId._id,
        title: h.episodeId.title,
        genre: h.episodeId.genre,
        thumbnailUrl: h.episodeId.thumbnailUrl,
        youtubeVideoId: h.episodeId.youtubeVideoId,
        watchedAt: h.watchedAt,
      }));

    res.status(200).json({
      episodes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { generateEpisodes, markWatched, getHistory };
