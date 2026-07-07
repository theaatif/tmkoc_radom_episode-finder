const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
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
    addedAt: {
      type: Date,
      default: Date.now,
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

// Compound unique index: a user can only favorite an episode once
favoriteSchema.index({ userId: 1, episodeId: 1 }, { unique: true });
// Efficient query for "most recent favorites"
favoriteSchema.index({ userId: 1, addedAt: -1 });

module.exports = mongoose.model('Favorite', favoriteSchema);
