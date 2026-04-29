import { notFoundError } from '../utils/errors.js';

export function notFoundHandler(request, response, next) {
  next(notFoundError(`Route not found: ${request.method} ${request.originalUrl}`));
}
