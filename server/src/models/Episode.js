const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Episode title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    genre: {
      type: String,
      index: true,
      default: '',
      trim: true,
      maxlength: [50, 'Genre cannot exceed 50 characters'],
    },
    youtubeVideoId: {
      type: String,
      required: [true, 'YouTube video ID is required'],
      unique: true,
      index: true,
      trim: true,
      maxlength: [20, 'YouTube video ID is too long'],
    },
    thumbnailUrl: {
      type: String,
      default: '',
      maxlength: [2048, 'Thumbnail URL is too long'],
    },
    durationSeconds: {
      type: Number,
      default: 0,
      min: [0, 'Duration cannot be negative'],
    },
    episodeNumber: {
      type: Number,
      index: true,
      default: null,
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

module.exports = mongoose.model('Episode', episodeSchema);
