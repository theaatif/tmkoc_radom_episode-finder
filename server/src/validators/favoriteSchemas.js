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
 * GET /share/:id — alphanumeric string (playlistId or shareToken).
 */
const shareParams = z.object({
  id: z
    .string()
    .min(1, 'id is required')
    .max(30, 'id is too long')
    .regex(/^[A-Za-z0-9_-]+$/, 'id contains invalid characters'),
});

/**
 * GET /share/:shareToken query — paginated.
 */
const shareQuery = z.object({
  ...paginationQuery,
});

/**
 * POST /share — no body expected, but validate against empty/malformed payload.
 */
const createShareBody = z.object({}).strict();

module.exports = { favoriteParams, favoritesQuery, shareParams, shareQuery, createShareBody };
