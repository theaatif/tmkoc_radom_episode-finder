const mongoose = require('mongoose');
const { nanoid } = require('nanoid');
const { Favorite, Episode, User, SharedPlaylist } = require('../models');
const ApiError = require('../utils/ApiError');

// Pagination defaults and limits
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT_IDS = 1000;   // lightweight — only ObjectIds
const MAX_LIMIT_FULL = 200;   // full populate — heavier payload

// Shared playlist limits
const MAX_SNAPSHOT_EPISODES = 2000;   // cap episodes per snapshot
const MAX_SNAPSHOTS_PER_USER = 50;    // max snapshots per user

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
 * POST /share
 * Auth required — snapshots the current user's favorites into a
 * SharedPlaylist and returns a playlistId for the share link.
 * Enforces per-user snapshot cap and auto-purges oldest on overflow.
 */
const createSharedPlaylist = async (req, res, next) => {
  try {
    const userId = req.userId;

    const [user, favorites] = await Promise.all([
      User.findById(userId).lean(),
      Favorite.find({ userId })
        .sort({ addedAt: -1 })
        .select('episodeId -_id')
        .lean(),
    ]);

    if (!user) {
      throw new ApiError(404, 'user_not_found', 'User not found');
    }

    const episodeIds = favorites
      .map((f) => f.episodeId)
      .filter(Boolean)
      .slice(0, MAX_SNAPSHOT_EPISODES);

    const playlistId = nanoid(12);

    await SharedPlaylist.create({
      playlistId,
      userId,
      episodeIds,
      ownerName: user.name,
    });

    // Enforce per-user cap — delete oldest snapshots beyond limit
    const excess = await SharedPlaylist.countDocuments({ userId }) - MAX_SNAPSHOTS_PER_USER;
    if (excess > 0) {
      const oldest = await SharedPlaylist.find({ userId })
        .sort({ createdAt: 1 })
        .limit(excess)
        .select('_id')
        .lean();
      await SharedPlaylist.deleteMany({ _id: { $in: oldest.map((s) => s._id) } });
    }

    res.status(201).json({ playlistId });
  } catch (err) {
    if (err.name === 'ApiError') return next(err);
    next(err);
  }
};

/**
 * GET /share/:id
 * Public — returns a shared playlist by playlistId (snapshot) or falls
 * back to a live favorites view by user shareToken.
 * Paginated and guarded against deleted episodes.
 */
const getSharedFavorites = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Try snapshot playlist first
    const playlist = await SharedPlaylist.findOne({ playlistId: id }).lean();
    if (playlist) {
      const page = Math.max(1, parseInt(req.query.page, 10) || DEFAULT_PAGE);
      const limit = Math.min(MAX_LIMIT_FULL, Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT));
      const skip = (page - 1) * limit;

      const episodeMap = await Episode.find({ _id: { $in: playlist.episodeIds } })
        .select('title genre thumbnailUrl youtubeVideoId')
        .lean()
        .then((eps) =>
          eps.reduce((map, ep) => {
            map[ep._id.toString()] = ep;
            return map;
          }, {})
        );

      // Preserve original snapshot order, skip deleted episodes
      const ordered = playlist.episodeIds
        .map((eid) => episodeMap[eid.toString()])
        .filter(Boolean);

      const total = ordered.length;
      const paginatedEpisodes = ordered.slice(skip, skip + limit).map((ep) => ({
        id: ep._id,
        title: ep.title,
        genre: ep.genre,
        thumbnailUrl: ep.thumbnailUrl,
        youtubeVideoId: ep.youtubeVideoId,
      }));

      return res.status(200).json({
        ownerName: playlist.ownerName,
        favorites: paginatedEpisodes,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    // Fallback: user shareToken (live favorites)
    const user = await User.findOne({ shareToken: id }).lean();
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

module.exports = { addFavorite, removeFavorite, getFavorites, getSharedFavorites, createSharedPlaylist };
