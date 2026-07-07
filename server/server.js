/**
 * TMKOC Random Episode Player — Server Entry Point
 *
 * Loads environment variables, validates them, connects to MongoDB & Redis,
 * then starts the Express HTTP server with graceful shutdown handling.
 */

require('dotenv').config();

const http = require('http');
const app = require('./src/app');
const config = require('./src/config');
const connectDB = require('./src/config/db');
const redis = require('./src/config/redis');
const mongoose = require('mongoose');

let server;

const start = async () => {
  // ── Validate critical env vars ──
  const required = [
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'GOOGLE_CLIENT_ID',
    'MONGODB_URI',
  ];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`❌ Missing required env variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  // Warn if JWT secrets are too short (< 32 chars = < 256 bits)
  if (process.env.JWT_ACCESS_SECRET.length < 32) {
    console.warn('⚠️  JWT_ACCESS_SECRET is shorter than 32 characters — use a stronger secret in production');
  }
  if (process.env.JWT_REFRESH_SECRET.length < 32) {
    console.warn('⚠️  JWT_REFRESH_SECRET is shorter than 32 characters — use a stronger secret in production');
  }

  // ── Connect to MongoDB ──
  await connectDB();

  // ── Start HTTP server ──
  server = http.createServer(app);

  // Set server-level timeouts to prevent slow loris and keepalive abuse
  server.keepAliveTimeout = 65000; // slightly above typical ALB idle timeout (60s)
  server.headersTimeout = 66000;   // must be > keepAliveTimeout
  server.requestTimeout = config.requestTimeout;

  server.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port} (${config.nodeEnv})`);
  });
};

// ──────────────────────────────────────────────
// Graceful shutdown — close connections cleanly
// ──────────────────────────────────────────────
const shutdown = async (signal) => {
  console.log(`\n${signal} received — starting graceful shutdown...`);

  // 1. Stop accepting new connections
  if (server) {
    await new Promise((resolve) => {
      server.close((err) => {
        if (err) console.error('Error closing HTTP server:', err.message);
        else console.log('✅ HTTP server closed');
        resolve();
      });
    });
  }

  // 2. Close MongoDB connection
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
  } catch (err) {
    console.error('Error closing MongoDB:', err.message);
  }

  // 3. Close Redis connection
  try {
    await redis.quit();
    console.log('✅ Redis connection closed');
  } catch (err) {
    console.error('Error closing Redis:', err.message);
  }

  console.log('Graceful shutdown complete');
  process.exit(0);
};

// Handle termination signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Catch unhandled promise rejections — log and exit
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // In production, crash to let the process manager restart a clean instance
  if (config.isProd) process.exit(1);
});

// Catch uncaught exceptions — always crash (state may be corrupt)
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

start();
