/**
 * Production-Grade TMKOC Episode Importer / Seeder
 *
 * Populates the episodes collection in MongoDB from YouTube playlists.
 *
 * Features:
 * 1. YouTube API Mode: Fetches all episodes from configured playlists via paginated
 *    requests with timeouts, exponential-backoff retries, and safe incremental
 *    reconciliation instead of destructive wipe-then-import.
 * 2. Safe Reconciliation: Deletes only episodes whose youtubeVideoId was NOT found
 *    in the current import run — never clears the entire collection upfront.
 * 3. Smart Era Classification: Parses episode number from title and maps it to
 *    correct era in the `genre` field (classic/golden/modern).
 * 4. Bulk Upserts: Uses `bulkWrite` with upsert on unique `youtubeVideoId`.
 * 5. Parallel Playlist Fetching: All playlists are fetched concurrently for speed.
 *
 * Usage:
 *   node src/seeds/importEpisodes.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');
const Episode = require('../models/Episode');

// ── Constants ──

const DEFAULT_PLAYLIST_IDS = [
  'PLyBAqOWU1mfUGnBl8IMAcutxMeeHw1--p', // Episodes 1–1000
  'PLyidjftviL2UKaKDxmfCPQF4taRL48qCA', // Episodes 1001–2000
  'PLyidjftviL2XhkUNofzpkLBgDQf5gAskA', // Episodes 2001–3000
  'PLyidjftviL2XcjaBpplhh6rWrumoArVQR', // Episodes 3001–4000
];

const FETCH_TIMEOUT_MS = parseInt(process.env.YT_FETCH_TIMEOUT_MS, 10) || 30_000;
const MAX_RETRIES = parseInt(process.env.YT_MAX_RETRIES, 10) || 3;
const MAX_PAGES_PER_PLAYLIST = parseInt(process.env.YT_MAX_PAGES_PER_PLAYLIST, 10) || 80;
const MAX_RESULTS_PER_PAGE = Math.min(parseInt(process.env.YT_PAGE_SIZE, 10) || 50, 50);

// ── Helpers ──

function parseEpisodeNumber(title) {
  const match = title.match(/(?:ep|episode|ep\.)\s*(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

function classifyEraFromTitle(title) {
  const n = parseEpisodeNumber(title);
  if (n !== null) {
    if (n <= 500) return 'classic';
    if (n <= 1500) return 'golden';
    return 'modern';
  }
  return 'classic';
}

/**
 * Delay helper for backoff.
 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetch with timeout via AbortController.
 */
async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Exponential-backoff retry wrapper for a fetch.
 * Retries on network errors, 429 (rate limit), and 5xx.
 * Respects Retry-After header when present.
 */
async function fetchWithRetry(url, retriesLeft = MAX_RETRIES) {
  for (let attempt = 0; attempt <= retriesLeft; attempt++) {
    try {
      const res = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);

      if (res.ok) return res;

      // Rate-limited — obey Retry-After or back off
      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get('retry-after'), 10);
        const delayMs = Number.isFinite(retryAfter)
          ? retryAfter * 1000
          : Math.min(1000 * 2 ** attempt + Math.random() * 1000, 60_000);
        console.warn(`   ⚠️  Rate-limited (429), waiting ${Math.round(delayMs / 1000)}s...`);
        await sleep(delayMs);
        continue;
      }

      // Server errors
      if (res.status >= 500) {
        if (attempt < retriesLeft) {
          const delayMs = Math.min(1000 * 2 ** attempt + Math.random() * 1000, 30_000);
          console.warn(`   ⚠️  Server error ${res.status}, retrying in ${Math.round(delayMs / 1000)}s...`);
          await sleep(delayMs);
          continue;
        }
      }

      // Non-retryable error
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error?.message || `YouTube API responded with status ${res.status}`);
    } catch (err) {
      if (err.name === 'AbortError') {
        if (attempt < retriesLeft) {
          const delayMs = Math.min(1000 * 2 ** attempt + Math.random() * 1000, 30_000);
          console.warn(`   ⚠️  Request timed out, retrying in ${Math.round(delayMs / 1000)}s...`);
          await sleep(delayMs);
          continue;
        }
        throw new Error('Request timed out after all retries');
      }
      if (attempt < retriesLeft && !err.message.startsWith('YouTube API')) {
        const delayMs = Math.min(1000 * 2 ** attempt + Math.random() * 1000, 30_000);
        console.warn(`   ⚠️  Network error: ${err.message}, retrying in ${Math.round(delayMs / 1000)}s...`);
        await sleep(delayMs);
        continue;
      }
      throw err;
    }
  }
  throw new Error('Exhausted all retries');
}

/**
 * Fetch all pages from a single playlist.
 */
async function fetchPlaylistFromYouTube(apiKey, playlistId) {
  const episodes = [];
  let pageToken = '';
  let pageCount = 0;

  do {
    pageCount++;
    const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('maxResults', String(MAX_RESULTS_PER_PAGE));
    url.searchParams.set('playlistId', playlistId);
    url.searchParams.set('key', apiKey);
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const res = await fetchWithRetry(url.toString());
    const data = await res.json();

    const batch = (data.items || [])
      .filter((item) => item.snippet?.resourceId?.videoId)
      .map((item) => {
        const title = item.snippet.title || '';
        const videoId = item.snippet.resourceId.videoId;
        const thumbnailUrl =
          item.snippet.thumbnails?.maxres?.url ||
          item.snippet.thumbnails?.high?.url ||
          item.snippet.thumbnails?.medium?.url ||
          `https://img.youtube.com/vi/${videoId}/0.jpg`;

        return {
          title,
          genre: classifyEraFromTitle(title),
          youtubeVideoId: videoId,
          thumbnailUrl,
          durationSeconds: 1200,
          episodeNumber: parseEpisodeNumber(title),
        };
      });

    episodes.push(...batch);
    console.log(`   📥 Playlist ${playlistId} page ${pageCount}: ${batch.length} episodes`);

    pageToken = data.nextPageToken || '';

    if (pageCount >= MAX_PAGES_PER_PLAYLIST) {
      console.warn(`   ⚠️  Reached page limit (${MAX_PAGES_PER_PLAYLIST}) for playlist ${playlistId}`);
      break;
    }
  } while (pageToken);

  return episodes;
}

/**
 * Bulk upsert episodes into MongoDB.
 * Returns count of written docs.
 */
async function saveEpisodesToDb(episodesList) {
  if (episodesList.length === 0) return 0;

  const bulkOps = episodesList.map((ep) => ({
    updateOne: {
      filter: { youtubeVideoId: ep.youtubeVideoId },
      update: { $set: ep },
      upsert: true,
    },
  }));

  const result = await Episode.bulkWrite(bulkOps);
  return result.upsertedCount + result.modifiedCount;
}

// ── Main ──

const run = async () => {
  const apiKey = process.env.YOUTUBE_API_KEY;

  const envPlaylistId = process.env.YOUTUBE_PLAYLIST_ID;
  const playlistIds = envPlaylistId
    ? envPlaylistId.split(',').map((id) => id.trim()).filter(Boolean)
    : DEFAULT_PLAYLIST_IDS;

  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB.\n');

    if (!apiKey) {
      console.error('❌ YOUTUBE_API_KEY is required. Set it in your .env file.');
      console.log('   Get a key at: https://console.cloud.google.com/apis/credentials');
      process.exit(1);
    }

    // ── Fetch all episodes from all playlists in parallel ──
    console.log(`📡 Fetching ${playlistIds.length} playlist(s) in parallel...`);
    const results = await Promise.all(
      playlistIds.map((pid) => fetchPlaylistFromYouTube(apiKey, pid))
    );

    const allEpisodes = results.flat();
    console.log(`\n📊 Total episodes fetched: ${allEpisodes.length}`);

    if (allEpisodes.length === 0) {
      console.log('⚠️  No episodes fetched — check your API key and playlist IDs.');
      process.exit(0);
    }

    // ── Safe reconciliation: delete only episodes not in this import ──
    const fetchedIds = allEpisodes.map((e) => e.youtubeVideoId);
    const deleteResult = await Episode.deleteMany({ youtubeVideoId: { $nin: fetchedIds } });
    console.log(`🧹 Removed ${deleteResult.deletedCount} stale episodes (no longer in playlists).`);

    // ── Bulk upsert ──
    const written = await saveEpisodesToDb(allEpisodes);
    console.log(`💾 Upserted/modified ${written} episodes in database.`);

    // ── Final counts ──
    const total = await Episode.countDocuments();
    const byEra = await Episode.aggregate([
      { $group: { _id: '$genre', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    console.log(`\n🎉 Import complete!`);
    console.log(`   Total episodes in DB: ${total}`);
    for (const era of byEra) {
      console.log(`     • ${era._id}: ${era.count}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Import failed:', err.message);
    process.exit(1);
  }
};

run();
