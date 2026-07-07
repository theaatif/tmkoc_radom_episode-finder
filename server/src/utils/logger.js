const config = require('../config');

/**
 * Structured logger with severity levels.
 *
 * Production output is JSON for log aggregators (CloudWatch, ELK, Datadog).
 * Development output is human-readable.
 */

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

const currentLevel = LEVELS[config.logLevel] ?? LEVELS.info;

function levelLabel(level) {
  return level.toUpperCase().padEnd(5);
}

function format(level, message, meta = {}) {
  const entry = {
    level: levelLabel(level),
    timestamp: new Date().toISOString(),
    message,
    ...meta,
  };
  return config.isDev ? `${entry.timestamp} ${entry.level} ${entry.message}${Object.keys(meta).length ? ' ' + JSON.stringify(meta) : ''}` : JSON.stringify(entry);
}

const logger = {
  debug(msg, meta) { if (currentLevel <= LEVELS.debug) console.debug(format('debug', msg, meta)); },
  info(msg, meta)  { if (currentLevel <= LEVELS.info)  console.info(format('info', msg, meta)); },
  warn(msg, meta)  { if (currentLevel <= LEVELS.warn)  console.warn(format('warn', msg, meta)); },
  error(msg, meta) { if (currentLevel <= LEVELS.error) console.error(format('error', msg, meta)); },

  /**
   * Convenience for security-relevant events so they can be filtered in logs.
   * @param {string} event — e.g. 'login.success', 'token.replay_attack'
   * @param {object} meta  — structured context
   */
  security(event, meta = {}) {
    this.warn(`[SECURITY] ${event}`, { event, ...meta, security_event: true });
  },
};

module.exports = logger;
