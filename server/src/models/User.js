const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: [true, 'googleId is required'],
      unique: true,
      index: true,
      immutable: true, // Cannot be changed after creation
    },
    email: {
      type: String,
      required: [true, 'email is required'],
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    name: {
      type: String,
      required: [true, 'name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    avatarUrl: {
      type: String,
      default: '',
      maxlength: [2048, 'Avatar URL is too long'],
    },
    shareToken: {
      type: String,
      unique: true,
      index: true,
      immutable: true, // Cannot be changed — permanent share link
    },
  },
  {
    timestamps: true,
    // Strip sensitive fields when serializing to JSON
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.googleId; // Never expose the Google sub claim to clients
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('User', userSchema);
