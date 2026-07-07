const { z } = require('zod');

/**
 * POST /auth/google — body must contain a non-empty Google ID token string.
 */
const googleLoginBody = z.object({
  idToken: z
    .string({
      required_error: 'idToken is required',
      invalid_type_error: 'idToken must be a string',
    })
    .min(1, 'idToken cannot be empty')
    .trim(),
});

/**
 * POST /auth/google/code — body must contain a non-empty Google authorization code.
 * Auth codes are typically ~200+ chars, so we enforce a reasonable minimum.
 */
const googleAuthCodeBody = z.object({
  code: z
    .string({
      required_error: 'Authorization code is required',
      invalid_type_error: 'Authorization code must be a string',
    })
    .min(10, 'Authorization code is too short')
    .max(8192, 'Authorization code is too long')
    .trim(),
});

/**
 * POST /auth/refresh — body must be empty (all data comes via cookies + auth header).
 * Using .strict() means any extra keys will cause a validation error.
 */
const refreshBody = z.object({}).strict();

module.exports = { googleLoginBody, googleAuthCodeBody, refreshBody };
