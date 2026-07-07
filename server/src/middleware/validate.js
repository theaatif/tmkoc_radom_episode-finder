const { ZodError } = require('zod');

/**
 * Generic Zod validation middleware factory.
 *
 * Validates `req.body`, `req.query`, and `req.params` against the
 * provided Zod schemas. On failure, returns a 400 with structured
 * error details so the client knows exactly what went wrong.
 *
 * Usage:
 *   router.post('/foo', validate({ body: myBodySchema }), handler);
 *   router.get('/bar', validate({ query: myQuerySchema, params: myParamsSchema }), handler);
 */
const validate = (schemas) => {
  return (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));

        return res.status(400).json({
          error: {
            code: 'validation_error',
            message: 'Request validation failed',
            details,
          },
        });
      }
      next(err);
    }
  };
};

module.exports = validate;
