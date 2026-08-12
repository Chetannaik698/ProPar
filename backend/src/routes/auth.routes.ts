/**
 * Authentication Routes
 *
 * Defines all authentication-related API endpoints.
 * Mounted at /api/v1/auth
 *
 * @module routes/auth
 */

import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  sendMagicLink,
  verifyMagicLink,
  googleAuth,
  appleAuth,
  microsoftAuth,
  getMe,
  checkEmail,
  signUp,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  logout,
} from '../controllers/auth.controller.js';

export const authRoutes = Router();

// ============================================
// Email Magic Link (Legacy / Parallel)
// ============================================

/** Send a magic-link email */
authRoutes.post('/email/send', asyncHandler(sendMagicLink));

/** Verify a magic-link token and return JWT */
authRoutes.post('/email/verify', asyncHandler(verifyMagicLink));

// ============================================
// Production Password-Based Auth
// ============================================

/** Check if email is registered */
authRoutes.post('/check', asyncHandler(checkEmail));

/** Sign up / Register a new user */
authRoutes.post('/signup', asyncHandler(signUp));

/** Log in an existing user */
authRoutes.post('/login', asyncHandler(login));

/** Verify email address using verification token */
authRoutes.post('/verify-email', asyncHandler(verifyEmail));

/** Request forgot password reset email */
authRoutes.post('/forgot-password', asyncHandler(forgotPassword));

/** Reset password using secure token */
authRoutes.post('/reset-password', asyncHandler(resetPassword));

/** Log out current user (deletes cookie) */
authRoutes.post('/logout', asyncHandler(logout));

// ============================================
// Social OAuth
// ============================================

/** Google OAuth — exchange ID token for JWT */
authRoutes.post('/google', asyncHandler(googleAuth));

/** Apple OAuth — exchange ID token for JWT */
authRoutes.post('/apple', asyncHandler(appleAuth));

/** Microsoft OAuth — exchange access token for JWT */
authRoutes.post('/microsoft', asyncHandler(microsoftAuth));

// ============================================
// Current User
// ============================================

/** Get current authenticated user */
authRoutes.get('/me', requireAuth, asyncHandler(getMe));
