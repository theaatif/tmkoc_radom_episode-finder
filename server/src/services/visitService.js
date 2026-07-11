const { UserVisit, User, WatchHistory } = require('../models');
const logger = require('../utils/logger');

/**
 * Record a user's visit with a cooldown to avoid logging rapid page refreshes.
 * Cooldown defaults to 30 minutes.
 * 
 * @param {string} userId - MongoDB User ID
 * @param {string} ip - Client IP
 * @param {string} userAgent - User Agent header
 */
async function recordVisit(userId, ip, userAgent) {
  if (!userId) return;

  try {
    const cooldownPeriodMs = 30 * 60 * 1000; // 30 minutes
    const cooldownTime = new Date(Date.now() - cooldownPeriodMs);

    // Check if the user has a logged visit in the last 30 minutes
    const recentVisit = await UserVisit.findOne({
      userId,
      visitedAt: { $gte: cooldownTime },
    });

    if (!recentVisit) {
      await UserVisit.create({
        userId,
        ip: ip || 'unknown',
        userAgent: userAgent || 'unknown',
        visitedAt: new Date(),
      });
      logger.info('visitService.recordVisit: logged new visit', { userId, ip });
    }
  } catch (err) {
    logger.error('visitService.recordVisit: failed to log visit', { userId, error: err.message });
  }
}

/**
 * Fetch stats on who visits most often, a log of recent visits, and all registered users.
 */
async function getVisitStats() {
  // Aggregate visits by user to find who visits most often
  const frequentVisitors = await UserVisit.aggregate([
    {
      $group: {
        _id: '$userId',
        visitCount: { $sum: 1 },
        lastVisitedAt: { $max: '$visitedAt' },
      },
    },
    {
      $sort: { visitCount: -1 },
    },
    {
      $limit: 15,
    },
    {
      $lookup: {
        from: 'users', // Mongoose user collection
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        visitCount: 1,
        lastVisitedAt: 1,
        'user.name': 1,
        'user.email': 1,
        'user.avatarUrl': 1,
      },
    },
  ]);

  // Fetch the 20 most recent visits across the platform
  const recentVisits = await UserVisit.find()
    .sort({ visitedAt: -1 })
    .limit(20)
    .populate('userId', 'name email avatarUrl')
    .lean();

  // Fetch all registered users
  const allUsers = await User.find()
    .sort({ createdAt: -1 })
    .select('name')
    .lean();

  // Fetch 100 most recent watch history entries across all users
  const recentWatches = await WatchHistory.find()
    .sort({ watchedAt: -1 })
    .limit(100)
    .populate('userId', 'name')
    .populate('episodeId', 'title episodeNumber')
    .lean();

  return {
    frequentVisitors,
    recentVisits: recentVisits.map(visit => ({
      id: visit._id,
      visitedAt: visit.visitedAt,
      ip: visit.ip,
      userAgent: visit.userAgent,
      user: visit.userId ? {
        id: visit.userId._id,
        name: visit.userId.name,
        email: visit.userId.email,
        avatarUrl: visit.userId.avatarUrl,
      } : null,
    })),
    allUsers: allUsers.map(user => ({
      id: user._id,
      name: user.name,
    })),
    recentWatches: recentWatches.map(watch => ({
      id: watch._id,
      watchedAt: watch.watchedAt || watch.createdAt || new Date(),
      lastPositionSeconds: watch.lastPositionSeconds || 0,
      user: watch.userId ? {
        id: watch.userId._id,
        name: watch.userId.name,
      } : { id: 'anonymous', name: 'Anonymous User' },
      episode: watch.episodeId ? {
        id: watch.episodeId._id,
        title: watch.episodeId.title,
        episodeNumber: watch.episodeId.episodeNumber,
      } : { id: 'unknown', title: 'Unknown Episode', episodeNumber: null },
    })),
  };
}

module.exports = {
  recordVisit,
  getVisitStats,
};
