/**
 * Authentication Middleware
 *
 * Verifies JWT tokens and attaches user data to the request.
 * Use `requireAuth` to protect routes that require authentication.
 *
 * @module middleware/auth
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt.js';

/**
 * Extend Express Request to include authenticated user data
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Require authentication middleware
 *
 * Extracts the JWT from the Authorization header (Bearer token),
 * verifies it, and attaches the decoded payload to `req.user`.
 *
 * @returns 401 if no token or invalid token
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    let token = '';

    // Check cookie first
    const cookiesHeader = req.headers.cookie;
    if (cookiesHeader) {
      const match = cookiesHeader.match(/(^|;)\s*token\s*=\s*([^;]+)/);
      if (match && match[2]) {
        token = decodeURIComponent(match[2]);
      }
    }

    // Fallback to Bearer token
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1] || '';
      }
    }

    if (!token) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'Please sign in to access this resource.',
      });
      return;
    }

    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({
      error: 'Invalid or expired token',
      message: 'Your session has expired. Please sign in again.',
    });
  }
};

/**
 * Optional auth middleware
 *
 * Same as requireAuth, but does NOT reject the request if no token is present.
 * If a valid token is found, attaches `req.user`. Otherwise, continues without it.
 */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    let token = '';

    const cookiesHeader = req.headers.cookie;
    if (cookiesHeader) {
      const match = cookiesHeader.match(/(^|;)\s*token\s*=\s*([^;]+)/);
      if (match && match[2]) {
        token = decodeURIComponent(match[2]);
      }
    }

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1] || '';
      }
    }

    if (token) {
      req.user = verifyToken(token);
    }
  } catch {
    // Token is invalid — silently continue without user
  }

  next();
};
