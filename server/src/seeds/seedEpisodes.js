/**
 * Seed script — populates the episodes collection with sample TMKOC episodes.
 *
 * Usage: node src/seeds/seedEpisodes.js
 *
 * This is a one-time script. It uses upsert on youtubeVideoId to avoid duplicates.
 */

require('dotenv').config();

const mongoose = require('mongoose');
const config = require('../config');
const Episode = require('../models/Episode');

const sampleEpisodes = [
  {
    title: 'Ep 1 - Taarak Mehta Ka Ooltah Chashmah',
    genre: 'classic',
    youtubeVideoId: 'dQw4w9WgXcQ', // placeholder — replace with real IDs
    thumbnailUrl: '',
    durationSeconds: 1320,
  },
  {
    title: 'Ep 2 - Diwali Celebration',
    genre: 'festival',
    youtubeVideoId: 'dQw4w9WgXcQ',
    thumbnailUrl: '',
    durationSeconds: 1260,
  },
  {
    title: 'Ep 3 - Jethalal Ka Plan',
    genre: 'comedy',
    youtubeVideoId: 'dQw4w9WgXcQ',
    thumbnailUrl: '',
    durationSeconds: 1300,
  },
  {
    title: 'Ep 4 - Babita Ji Ki Party',
    genre: 'comedy',
    youtubeVideoId: 'dQw4w9WgXcQ',
    thumbnailUrl: '',
    durationSeconds: 1350,
  },
  {
    title: 'Ep 5 - Tapu Sena Ka Dhamaal',
    genre: 'classic',
    youtubeVideoId: 'dQw4w9WgXcQ',
    thumbnailUrl: '',
    durationSeconds: 1280,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB for seeding');

    for (const ep of sampleEpisodes) {
      await Episode.findOneAndUpdate(
        { youtubeVideoId: ep.youtubeVideoId, title: ep.title },
        ep,
        { upsert: true, new: true }
      );
    }

    console.log(`✅ Seeded ${sampleEpisodes.length} episodes`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
