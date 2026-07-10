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
 *
 * Returns up to 4 random episodes the user has NOT yet watched.
 *
 * Algorithm: "random-candidate + post-filter"
 *   1. $sample a small batch of candidates from Episodes (O(1) regardless of watch count).
 *   2. Check which candidates are watched via a targeted $in query on the
 *      { userId, episodeId } compound unique index (always hits the index).
 *   3. Filter out watched ones, repeat up to MAX_ROUNDS to fill BATCH_SIZE slots.
 *
 * This avoids the growing $nin array problem entirely — no matter how many
 * episodes the user has watched, the query load is bounded and predictable.
 */
const generateEpisodes = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const { genre } = req.query;

    const matchStage = genre ? { genre } : {};
    const MAX_ROUNDS = 3;

    const result = [];
    const seenIds = new Set();

    for (let round = 0; round < MAX_ROUNDS && result.length < BATCH_SIZE; round++) {
      const needed = BATCH_SIZE - result.length;
      const fetchSize = needed * 2; // oversample to account for watched hits

      const candidates = await Episode.aggregate([
        { $match: matchStage },
        { $sample: { size: fetchSize } },
      ]);

      if (candidates.length === 0) break;

      const candidateIds = candidates.map((c) => c._id);

      // Index-covered query on { userId, episodeId }
      const watched = await WatchHistory.find({
        userId,
        episodeId: { $in: candidateIds },
      })
        .select('episodeId')
        .lean();

      const watchedIdSet = new Set(watched.map((w) => w.episodeId.toString()));

      for (const ep of candidates) {
        const epId = ep._id.toString();
        if (!watchedIdSet.has(epId) && !seenIds.has(epId)) {
          result.push(ep);
          seenIds.add(epId);
          if (result.length === BATCH_SIZE) break;
        }
      }
    }

    if (result.length === 0) {
      return res.status(200).json({ done: true, episodes: [], remaining: 0 });
    }

    // Count remaining unwatched in this scope
    const totalCount = await Episode.countDocuments(matchStage);
    let watchedCount;

    if (genre) {
      // Count watched episodes in this genre using a database-side lookup
      const watchedCountResult = await WatchHistory.aggregate([
        { $match: { userId } },
        {
          $lookup: {
            from: 'episodes',
            localField: 'episodeId',
            foreignField: '_id',
            as: 'episode',
          },
        },
        { $unwind: '$episode' },
        { $match: { 'episode.genre': genre } },
        { $count: 'count' },
      ]);
      watchedCount = watchedCountResult[0]?.count || 0;
    } else {
      watchedCount = await WatchHistory.countDocuments({ userId });
    }

    const remaining = Math.max(0, totalCount - watchedCount);

    res.status(200).json({
      episodes: result.map((ep) => ({
        id: ep._id,
        title: ep.title,
        genre: ep.genre,
        thumbnailUrl: ep.thumbnailUrl,
        youtubeVideoId: ep.youtubeVideoId,
      })),
      remaining: Math.max(0, remaining - result.length),
    });
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
