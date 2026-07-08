const mongoose = require('mongoose');

/**
 * Maximum episodes per snapshot to stay well within BSON's 16MB document limit.
 */
const MAX_SNAPSHOT_EPISODES = 2000;

const sharedPlaylistSchema = new mongoose.Schema({
  playlistId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    immutable: true,
    index: true,
  },
  episodeIds: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Episode',
    }],
    validate: {
      validator: (arr) => arr.length <= MAX_SNAPSHOT_EPISODES,
      message: `Snapshot cannot exceed ${MAX_SNAPSHOT_EPISODES} episodes`,
    },
  },
  ownerName: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
});

// TTL index — auto-delete snapshots after 1 year
sharedPlaylistSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

module.exports = mongoose.model('SharedPlaylist', sharedPlaylistSchema);
module.exports.MAX_SNAPSHOT_EPISODES = MAX_SNAPSHOT_EPISODES;
