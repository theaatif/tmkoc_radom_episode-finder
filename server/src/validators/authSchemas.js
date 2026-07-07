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

module.exports = { googleLoginBody };
