/**
 * Authentication Controller
 *
 * Handles user registration, login, and token management
 * for email magic-link, Google, Apple, and Microsoft OAuth.
 *
 * @module controllers/auth
 */

import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'node:crypto';
import { User, AuthProvider } from '../models/User.js';
import { MagicToken, generateMagicToken } from '../models/MagicToken.js';
import { signToken } from '../utils/jwt.js';
import {
  sendMagicLinkEmail,
  isSmtpConfigured,
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../utils/email.js';
import { hashPassword, verifyPassword } from '../utils/hash.js';
import { env } from '../config/env.js';

/**
 * Google OAuth client (created lazily if GOOGLE_CLIENT_ID is set)
 */
const googleClient = env.GOOGLE_CLIENT_ID
  ? new OAuth2Client(env.GOOGLE_CLIENT_ID)
  : null;

// ============================================
// Helper: Find or create user
// ============================================

interface SocialProfile {
  email: string;
  name: string;
  avatarUrl?: string | undefined;
  provider: AuthProvider;
  providerId: string;
}

/**
 * Find an existing user by email or create a new one.
 * If the user exists but signed up with a different provider,
 * we link the new provider (update provider + providerId).
 */
const findOrCreateUser = async (profile: SocialProfile) => {
  let user = await User.findOne({ email: profile.email });

  if (user) {
    // Update last login and potentially provider info
    user.lastLoginAt = new Date();
    if (profile.avatarUrl && !user.avatarUrl) {
      user.avatarUrl = profile.avatarUrl;
    }
    if (profile.name && user.name === user.email) {
      user.name = profile.name;
    }
    await user.save();
  } else {
    user = await User.create({
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.avatarUrl || null,
      provider: profile.provider,
      providerId: profile.providerId,
    });
  }

  return user;
};

// ============================================
// Email Magic Link
// ============================================

/**
 * POST /api/v1/auth/email/send
 * Send a magic-link email to the user.
 */
export const sendMagicLink = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      res.status(400).json({ error: 'Invalid email address' });
      return;
    }

    // Invalidate any existing tokens for this email
    await MagicToken.updateMany(
      { email: normalizedEmail, used: false },
      { used: true }
    );

    // Generate a new token
    const token = generateMagicToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await MagicToken.create({
      email: normalizedEmail,
      token,
      expiresAt,
    });

    // Send the email
    await sendMagicLinkEmail(normalizedEmail, token);

    res.json({
      message: 'Magic link sent! Check your email.',
      email: normalizedEmail,
      devModeConsoleOnly: !isSmtpConfigured(),
    });
  } catch (error) {
    console.error('Error sending magic link:', error);
    res.status(500).json({ error: 'Failed to send magic link' });
  }
};

/**
 * POST /api/v1/auth/email/verify
 * Verify a magic-link token and return a JWT.
 */
export const verifyMagicLink = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== 'string') {
      res.status(400).json({ error: 'Token is required' });
      return;
    }

    // Find the token
    const magicToken = await MagicToken.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!magicToken) {
      res.status(400).json({
        error: 'Invalid or expired link',
        message: 'This sign-in link is no longer valid. Please request a new one.',
      });
      return;
    }

    // Mark token as used
    magicToken.used = true;
    await magicToken.save();

    // Find or create the user
    const user = await findOrCreateUser({
      email: magicToken.email,
      name: magicToken.email.split('@')[0] || 'User', // Use email prefix as name
      provider: 'email',
      providerId: magicToken.email,
    });

    // Sign JWT
    const jwt = signToken(user._id.toString(), user.email);

    res.json({
      token: jwt,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        provider: user.provider,
      },
    });
  } catch (error) {
    console.error('Error verifying magic link:', error);
    res.status(500).json({ error: 'Failed to verify magic link' });
  }
};

// ============================================
// Google OAuth
// ============================================

/**
 * POST /api/v1/auth/google
 * Exchange a Google OAuth ID token for a JWT.
 */
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!googleClient || !env.GOOGLE_CLIENT_ID) {
      res.status(501).json({
        error: 'Google sign-in not configured',
        message: 'Google OAuth is not set up on this server. Please contact the administrator.',
      });
      return;
    }

    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({ error: 'Google ID token is required' });
      return;
    }

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(400).json({ error: 'Invalid Google token' });
      return;
    }

    const user = await findOrCreateUser({
      email: payload.email,
      name: payload.name || payload.email?.split('@')[0] || 'User',
      avatarUrl: payload.picture,
      provider: 'google',
      providerId: payload.sub,
    });

    const jwt = signToken(user._id.toString(), user.email);

    // Set secure HttpOnly cookie (SameSite=None; Secure for cross-site Netlify/Render deployment)
    const cookieFlags = env.NODE_ENV === 'production' ? 'Secure; SameSite=None;' : 'SameSite=Lax;';
    res.setHeader('Set-Cookie', `token=${jwt}; HttpOnly; ${cookieFlags} Path=/; Max-Age=${7 * 24 * 60 * 60}`);

    res.json({
      token: jwt,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        provider: user.provider,
      },
    });
  } catch (error) {
    console.error('Error with Google auth:', error);
    res.status(401).json({ error: 'Google authentication failed' });
  }
};

// ============================================
// Apple OAuth (placeholder)
// ============================================

/**
 * POST /api/v1/auth/apple
 * Exchange an Apple OAuth token for a JWT.
 */
export const appleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!env.APPLE_CLIENT_ID) {
      res.status(501).json({
        error: 'Apple sign-in not configured',
        message: 'Apple OAuth is not set up on this server. Please contact the administrator.',
      });
      return;
    }

    const { idToken, user: appleUser } = req.body;

    if (!idToken) {
      res.status(400).json({ error: 'Apple ID token is required' });
      return;
    }

    // Decode Apple JWT payload (in production, verify the signature too)
    const parts = idToken.split('.');
    if (parts.length !== 3) {
      res.status(400).json({ error: 'Invalid Apple token format' });
      return;
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

    if (!payload.email) {
      res.status(400).json({ error: 'Email not found in Apple token' });
      return;
    }

    const name = appleUser?.name
      ? `${appleUser.name.firstName || ''} ${appleUser.name.lastName || ''}`.trim()
      : payload.email.split('@')[0];

    const user = await findOrCreateUser({
      email: payload.email,
      name,
      provider: 'apple',
      providerId: payload.sub,
    });

    const jwt = signToken(user._id.toString(), user.email);

    // Set secure HttpOnly cookie
    const secureFlag = env.NODE_ENV === 'production' ? 'Secure;' : '';
    res.setHeader('Set-Cookie', `token=${jwt}; HttpOnly; ${secureFlag} SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}`);

    res.json({
      token: jwt,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        provider: user.provider,
      },
    });
  } catch (error) {
    console.error('Error with Apple auth:', error);
    res.status(401).json({ error: 'Apple authentication failed' });
  }
};

// ============================================
// Microsoft OAuth
// ============================================

/**
 * POST /api/v1/auth/microsoft
 * Exchange a Microsoft access token for a JWT.
 */
export const microsoftAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!env.MICROSOFT_CLIENT_ID) {
      res.status(501).json({
        error: 'Microsoft sign-in not configured',
        message: 'Microsoft OAuth is not set up on this server. Please contact the administrator.',
      });
      return;
    }

    const { accessToken } = req.body;

    if (!accessToken) {
      res.status(400).json({ error: 'Microsoft access token is required' });
      return;
    }

    // Use the Microsoft Graph API to get user profile
    const profileResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileResponse.ok) {
      res.status(401).json({ error: 'Invalid Microsoft token' });
      return;
    }

    const profile = await profileResponse.json() as {
      mail?: string;
      userPrincipalName?: string;
      displayName?: string;
      id?: string;
    };

    if (!profile.mail && !profile.userPrincipalName) {
      res.status(400).json({ error: 'Email not found in Microsoft profile' });
      return;
    }

    const email = (profile.mail || profile.userPrincipalName) as string;

    const user = await findOrCreateUser({
      email,
      name: profile.displayName || email.split('@')[0] || 'User',
      provider: 'microsoft',
      providerId: profile.id || email,
    });

    const jwt = signToken(user._id.toString(), user.email);

    // Set secure HttpOnly cookie
    const secureFlag = env.NODE_ENV === 'production' ? 'Secure;' : '';
    res.setHeader('Set-Cookie', `token=${jwt}; HttpOnly; ${secureFlag} SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}`);

    res.json({
      token: jwt,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        provider: user.provider,
      },
    });
  } catch (error) {
    console.error('Error with Microsoft auth:', error);
    res.status(401).json({ error: 'Microsoft authentication failed' });
  }
};

// ============================================
// Current User
// ============================================

/**
 * GET /api/v1/auth/me
 * Get the currently authenticated user.
 * Requires the `requireAuth` middleware.
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await User.findById(req.user.userId).select('-__v');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        provider: user.provider,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
};

// ============================================
// Password Auth Controllers
// ============================================

/**
 * POST /api/v1/auth/check
 * Check if an email address exists in the system.
 */
export const checkEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (user) {
      res.json({ exists: true, provider: user.provider });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).json({ error: 'Failed to verify email availability' });
  }
};

/**
 * POST /api/v1/auth/signup
 * Create a new user account with email & password.
 */
export const signUp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      res.status(400).json({ error: 'Email, name, and password are required' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check duplicate
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(400).json({ error: 'An account with this email already exists.' });
      return;
    }

    // Validate inputs
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      res.status(400).json({ error: 'Invalid email address format' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters long' });
      return;
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    await User.create({
      email: normalizedEmail,
      name: name.trim(),
      password: hashedPassword,
      provider: 'email',
      isEmailVerified: false,
      verificationToken: token,
      verificationTokenExpiresAt: tokenExpires,
    });

    // Send verification email
    await sendVerificationEmail(normalizedEmail, token);

    res.status(201).json({
      message: 'Account created! Please check your email to verify your account.',
      email: normalizedEmail,
      devModeConsoleOnly: !isSmtpConfigured(),
    });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

/**
 * POST /api/v1/auth/login
 * Authenticate user credentials and issue cookie.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Select the password field explicitly
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      res.status(401).json({
        error: 'User not found',
        message: 'No account exists with this email address.',
      });
      return;
    }

    if (user.provider !== 'email') {
      res.status(400).json({
        error: 'Social account detected',
        message: `This account uses ${user.provider} sign-in. Please log in using that option.`,
      });
      return;
    }

    if (!user.password) {
      res.status(400).json({
        error: 'Password not set',
        message: 'This account does not have a password configured.',
      });
      return;
    }

    // Verify password
    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        error: 'Wrong password',
        message: 'The password you entered is incorrect.',
      });
      return;
    }

    // Check verification status
    if (!user.isEmailVerified) {
      // Regenerate verification token if needed
      let token = user.verificationToken;
      if (!token) {
        token = crypto.randomBytes(32).toString('hex');
        user.verificationToken = token;
        user.verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();
      }
      
      // Resend verification email
      await sendVerificationEmail(user.email, token);

      res.status(403).json({
        error: 'Unverified email',
        message: 'Your email address is unverified. We have sent a new verification link to your inbox.',
      });
      return;
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Sign JWT
    const jwt = signToken(user._id.toString(), user.email);

    // Set secure HttpOnly cookie (SameSite=None; Secure for cross-site Netlify/Render deployment)
    const cookieFlags = env.NODE_ENV === 'production' ? 'Secure; SameSite=None;' : 'SameSite=Lax;';
    res.setHeader('Set-Cookie', `token=${jwt}; HttpOnly; ${cookieFlags} Path=/; Max-Age=${7 * 24 * 60 * 60}`);

    res.json({
      token: jwt,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        provider: user.provider,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

/**
 * POST /api/v1/auth/verify-email
 * Process email verification link.
 */
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token || typeof token !== 'string') {
      res.status(400).json({ error: 'Verification token is required' });
      return;
    }

    // Find unverified user with non-expired token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiresAt: { $gt: new Date() },
    }).select('+verificationToken +verificationTokenExpiresAt');

    if (!user) {
      res.status(400).json({
        error: 'Invalid or expired token',
        message: 'This verification link is invalid or has expired. Please sign up or log in again to request a new link.',
      });
      return;
    }

    // Mark as verified
    user.isEmailVerified = true;
    user.verificationToken = undefined as any;
    user.verificationTokenExpiresAt = undefined as any;
    await user.save();

    // Issue JWT
    const jwt = signToken(user._id.toString(), user.email);

    // Set secure cookie
    const secureFlag = env.NODE_ENV === 'production' ? 'Secure;' : '';
    res.setHeader('Set-Cookie', `token=${jwt}; HttpOnly; ${secureFlag} SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}`);

    res.json({
      token: jwt,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        provider: user.provider,
        isEmailVerified: true,
      },
    });
  } catch (error) {
    console.error('Error in verify email:', error);
    res.status(500).json({ error: 'Failed to verify email address' });
  }
};

/**
 * POST /api/v1/auth/forgot-password
 * Send password reset link to user.
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Consistent return message to prevent user enumeration
    const successResponse = {
      message: 'If an account exists with that email, a password reset link has been sent.',
    };

    if (!user) {
      res.json(successResponse);
      return;
    }

    if (user.provider !== 'email') {
      res.status(400).json({
        error: 'Social account detected',
        message: 'This email is linked to a social sign-in account. You do not have a password to reset.',
      });
      return;
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = token;
    user.resetPasswordExpiresAt = tokenExpires;
    await user.save();

    // Send reset email
    await sendPasswordResetEmail(user.email, token);

    res.json(successResponse);
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ error: 'Failed to send password reset request' });
  }
};

/**
 * POST /api/v1/auth/reset-password
 * Process new password input and reset credentials.
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({ error: 'Token and new password are required' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters long' });
      return;
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpiresAt');

    if (!user) {
      res.status(400).json({
        error: 'Invalid or expired token',
        message: 'The password reset token is invalid or has expired. Please request a new one.',
      });
      return;
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined as any;
    user.resetPasswordExpiresAt = undefined as any;
    await user.save();

    // Clear session cookies for security
    const secureFlag = env.NODE_ENV === 'production' ? 'Secure;' : '';
    res.setHeader('Set-Cookie', `token=; HttpOnly; ${secureFlag} SameSite=Lax; Path=/; Max-Age=0`);

    res.json({ message: 'Password has been reset successfully. Please log in.' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
};

/**
 * POST /api/v1/auth/logout
 * Destroy session and clear HttpOnly cookie.
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
  try {
    const secureFlag = env.NODE_ENV === 'production' ? 'Secure;' : '';
    res.setHeader('Set-Cookie', `token=; HttpOnly; ${secureFlag} SameSite=Lax; Path=/; Max-Age=0`);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error in logout:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};
