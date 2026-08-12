/**
 * 404 Not Found middleware
 *
 * This middleware handles requests to routes that don't exist.
 * It should be placed after all other route definitions.
 *
 * @module middleware/notFound
 */

import { Request, Response } from 'express';

/**
 * 404 Not Found handler
 *
 * This middleware catches all requests to undefined routes and returns
 * a standardized 404 response.
 *
 * @param req - Express request object
 * @param res - Express response object
 */
export const notFound = (req: Request, res: Response): void => {
  const statusCode = 404;
  const message = `Route ${req.originalUrl} not found`;

  // Log 404 errors for debugging
  console.warn(`⚠️  404 Not Found: ${req.method} ${req.originalUrl}`);

  // Send 404 response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
    },
  });
};