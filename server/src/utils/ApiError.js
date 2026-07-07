/**
 * Custom API error — carries a machine-readable `code` and HTTP `statusCode`.
 */
class ApiError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'ApiError';
  }

  static badRequest(message = 'Bad request') {
    return new ApiError(400, 'validation_error', message);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, 'unauthorized', message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, 'not_found', message);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, 'internal_error', message);
  }
}

module.exports = ApiError;
