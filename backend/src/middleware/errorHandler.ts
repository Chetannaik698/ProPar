/**
 * Centralized error handling middleware
 *
 * This middleware catches all errors passed via next(error) and formats them
 * into consistent JSON responses. It handles different error types and provides
 * appropriate HTTP status codes and error messages.
 *
 * @module middleware/errorHandler
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Custom error class for application-specific errors
 * Extends the native Error class to include status code and additional metadata
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code: string;

  /**
   * Create an application error
   * @param message - Human-readable error message
   * @param statusCode - HTTP status code (default: 500)
   * @param isOperational - Whether this is an operational error (default: true)
   * @param code - Machine-readable error code
   */
  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    // Maintains proper stack trace for where our error was thrown (only available in V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error response interface
 */
interface ErrorResponse {
  success: boolean;
  error: {
    message: string;
    code: string;
    statusCode: number;
    stack?: string;
  };
}

/**
 * Centralized error handling middleware
 *
 * This middleware should be the last middleware in the stack.
 * It catches all errors and formats them into consistent JSON responses.
 *
 * In production, stack traces are hidden from the client for security.
 * In development, stack traces are included to aid debugging.
 *
 * @param err - The error object
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode: number;
  let message: string;
  let isOperational: boolean;

  // Check if error is an instance of AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  } else {
    // For non-AppError instances, default to 500 Internal Server Error
    statusCode = 500;
    message = 'Internal Server Error';
    isOperational = false;
  }

  // Log error for debugging
  console.error('❌ Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    statusCode,
    isOperational,
  });

  // Build error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message,
      code: err instanceof AppError ? err.code : 'INTERNAL_ERROR',
      statusCode,
    },
  };

  // Include stack trace in development mode
  if (process.env['NODE_ENV'] === 'development' && err.stack) {
    errorResponse.error.stack = err.stack;
  }

  // Send response
  res.status(statusCode).json(errorResponse);
};

/**
 * Async handler wrapper
 *
 * Wraps async route handlers to catch errors and pass them to the error handling middleware.
 * This eliminates the need for try-catch blocks in every async route handler.
 *
 * @param fn - Async route handler function
 * @returns Wrapped function that catches errors
 *
 * @example
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await User.find();
 *   res.json({ success: true, data: users });
 * }));
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};