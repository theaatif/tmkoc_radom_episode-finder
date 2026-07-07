const mongoose = require('mongoose');

const watchHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
      index: true,
      immutable: true,
    },
    episodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Episode',
      required: [true, 'episodeId is required'],
      immutable: true,
    },
    watchedAt: {
      type: Date,
      default: Date.now,
    },
    lastPositionSeconds: {
      type: Number,
      default: 0,
      min: [0, 'Position cannot be negative'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound unique index: a user can only watch an episode once
watchHistorySchema.index({ userId: 1, episodeId: 1 }, { unique: true });
// Efficient query for "most recent watches"
watchHistorySchema.index({ userId: 1, watchedAt: -1 });

module.exports = mongoose.model('WatchHistory', watchHistorySchema);
