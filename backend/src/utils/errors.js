export class AppError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function validationError(message, details = undefined) {
  return new AppError(400, message, details);
}

export function notFoundError(message = 'Resource not found') {
  return new AppError(404, message);
}

export function isSqliteError(error) {
  return typeof error?.code === 'string' && error.code.startsWith('SQLITE_');
}
