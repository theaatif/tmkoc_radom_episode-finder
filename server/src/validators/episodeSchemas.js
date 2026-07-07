const { z } = require('zod');

/**
 * Reusable MongoDB ObjectId validator.
 * 24-character hex string.
 */
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Must be a valid 24-character ObjectId');

/**
 * Reusable pagination query params.
 */
const paginationQuery = {
  page: z.coerce
    .number()
    .int()
    .min(1, 'Page must be at least 1')
    .max(10000, 'Page number is too large')
    .optional()
    .default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .optional()
    .default(20),
};

/**
 * GET /episodes/generate — optional genre query param.
 */
const generateQuery = z.object({
  genre: z
    .string()
    .trim()
    .min(1, 'genre cannot be empty')
    .max(50, 'genre cannot exceed 50 characters')
    .optional(),
});

/**
 * GET /episodes/history — paginated.
 */
const historyQuery = z.object({
  ...paginationQuery,
});

/**
 * POST /episodes/:id/watch — id must be a valid ObjectId.
 */
const watchParams = z.object({
  id: objectIdSchema,
});

module.exports = { objectIdSchema, paginationQuery, generateQuery, historyQuery, watchParams };
