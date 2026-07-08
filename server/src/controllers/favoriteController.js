const mongoose = require('mongoose');
const { Favorite, Episode, User } = require('../models');
const ApiError = require('../utils/ApiError');

// Pagination defaults and limits
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT_IDS = 1000;   // lightweight — only ObjectIds
const MAX_LIMIT_FULL = 200;   // full populate — heavier payload

/**
 * POST /favorites/:episodeId
 * Adds an episode to the current user's favorites.
 * Verifies the episode exists before favoriting (prevents phantom references).
 */
const addFavorite = async (req, res, next) => {
  try {
    const { episodeId } = req.params;
    // episodeId format is guaranteed by Zod validation middleware

    // Verify the episode actually exists
    const episode = await Episode.findById(episodeId).lean();
    if (!episode) {
      throw ApiError.notFound('Episode not found');
    }

    await Favorite.findOneAndUpdate(
      { userId: req.userId, episodeId },
      { userId: req.userId, episodeId, addedAt: new Date() },
      { upsert: true, new: true }
    );

    res.sendStatus(201);
  } catch (err) {
    if (err.name === 'ApiError') return next(err);
    next(err);
  }
};

/**
 * DELETE /favorites/:episodeId
 * Removes an episode from the current user's favorites.
 */
const removeFavorite = async (req, res, next) => {
  try {
    const { episodeId } = req.params;
    // episodeId format is guaranteed by Zod validation middleware

    await Favorite.findOneAndDelete({ userId: req.userId, episodeId });
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /favorites?page=1&limit=20&idsOnly=true
 * Lists the current user's favorites with pagination.
 * Pass idsOnly=true for a lightweight response with only episode IDs.
 */
const getFavorites = async (req, res, next) => {
  try {
    const idsOnly = req.query.idsOnly === 'true';
    const page = Math.max(1, parseInt(req.query.page, 10) || DEFAULT_PAGE);
    const maxLimit = idsOnly ? MAX_LIMIT_IDS : MAX_LIMIT_FULL;
    const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT));
    const skip = (page - 1) * limit;

    let favoritesQuery = Favorite.find({ userId: req.userId })
      .sort({ addedAt: -1 })
      .skip(skip)
      .limit(limit);

    if (!idsOnly) {
      favoritesQuery = favoritesQuery.populate({ path: 'episodeId', select: 'title genre thumbnailUrl youtubeVideoId' });
    }

    const [favorites, total] = await Promise.all([
      favoritesQuery.lean().exec(),
      Favorite.countDocuments({ userId: req.userId }),
    ]);

    const episodes = favorites
      .filter((f) => f && f.episodeId)
      .map((f) => {
        if (idsOnly) {
          const idVal = f.episodeId._id || f.episodeId;
          return { id: idVal.toString(), addedAt: f.addedAt };
        }
        return {
          id: f.episodeId._id.toString(),
          title: f.episodeId.title,
          genre: f.episodeId.genre,
          thumbnailUrl: f.episodeId.thumbnailUrl,
          youtubeVideoId: f.episodeId.youtubeVideoId,
          addedAt: f.addedAt,
        };
      });

    res.status(200).json({
      favorites: episodes,
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

/**
 * GET /share/:shareToken
 * Public — returns a user's favorites by their opaque shareToken.
 * Paginated and guarded against deleted episodes.
 */
const getSharedFavorites = async (req, res, next) => {
  try {
    const { shareToken } = req.params;

    const user = await User.findOne({ shareToken }).lean();
    if (!user) {
      throw new ApiError(404, 'share_link_not_found', 'Share link not found');
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || DEFAULT_PAGE);
    const idsOnly = false;
    const maxLimit = idsOnly ? MAX_LIMIT_IDS : MAX_LIMIT_FULL;
    const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT));
    const skip = (page - 1) * limit;

    const [favorites, total] = await Promise.all([
      Favorite.find({ userId: user._id })
        .sort({ addedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('episodeId', 'title genre thumbnailUrl youtubeVideoId')
        .lean(),
      Favorite.countDocuments({ userId: user._id }),
    ]);

    const episodes = favorites
      .filter((f) => f.episodeId)
      .map((f) => ({
        id: f.episodeId._id,
        title: f.episodeId.title,
        genre: f.episodeId.genre,
        thumbnailUrl: f.episodeId.thumbnailUrl,
        youtubeVideoId: f.episodeId.youtubeVideoId,
      }));

    res.status(200).json({
      ownerName: user.name,
      favorites: episodes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    if (err.name === 'ApiError') return next(err);
    next(err);
  }
};

module.exports = { addFavorite, removeFavorite, getFavorites, getSharedFavorites };
