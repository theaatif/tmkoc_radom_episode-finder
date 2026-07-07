const Redis = require('ioredis');
const config = require('./index');

/**
 * Shared Redis client — used for refresh-token storage, rate-limit counters,
 * and hot-path caching.
 */
const redisOptions = {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 2000);
    return delay;
  },
};

// Only pass password if explicitly configured (undefined skips the AUTH command)
if (config.redis.password) {
  redisOptions.password = config.redis.password;
}

const redis = new Redis(config.redis.url, redisOptions);

redis.on('connect', () => console.log('✅ Redis connected'));
redis.on('error', (err) => console.error('❌ Redis error:', err.message));

module.exports = redis;
