const { z } = require('zod');
const { objectIdSchema, paginationQuery } = require('./episodeSchemas');

/**
 * POST / DELETE /favorites/:episodeId — episodeId must be a valid ObjectId.
 */
const favoriteParams = z.object({
  episodeId: objectIdSchema,
});

/**
 * GET /favorites — paginated.
 */
const favoritesQuery = z.object({
  ...paginationQuery,
});

/**
 * GET /share/:shareToken — shareToken must be a non-empty alphanumeric string.
 */
const shareParams = z.object({
  shareToken: z
    .string()
    .min(1, 'shareToken is required')
    .max(30, 'shareToken is too long')
    .regex(/^[A-Za-z0-9_-]+$/, 'shareToken contains invalid characters'),
});

/**
 * GET /share/:shareToken query — paginated.
 */
const shareQuery = z.object({
  ...paginationQuery,
});

module.exports = { favoriteParams, favoritesQuery, shareParams, shareQuery };
