import { env } from '../config/env.js';
import { AppError, isSqliteError } from '../utils/errors.js';

export function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    next(error);
    return;
  }

  const isKnownError = error instanceof AppError;
  const isDatabaseError = isSqliteError(error);
  const statusCode = isKnownError ? error.statusCode : 500;
  const message = isKnownError
    ? error.message
    : isDatabaseError
      ? 'Database operation failed'
      : 'Internal server error';

  if (env.nodeEnv !== 'test' && statusCode >= 500) {
    console.error(error);
  }

  response.status(statusCode).json({
    error: {
      message,
      ...(error.details ? { details: error.details } : {})
    }
  });
}
