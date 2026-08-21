/**
 * Express application configuration
 *
 * This file sets up the Express application with all middleware,
 * routes, and error handling. It exports the configured app instance
 * which can be used by the server entry point.
 *
 * @module app
 */

import express, { Application, Request } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import { isDevelopment } from './config/env.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRouter } from './routes/index.js';

const DEFAULT_ALLOWED_ORIGINS = [
  'https://propaar.netlify.app',
  'https://propar.netlify.app',
  'https://chatgpt.com',
  'https://gemini.google.com',
  'https://gemini.googleusercontent.com',
  'https://claude.ai',
  'https://mail.google.com',
];

const EXTENSION_ORIGIN_PATTERN = /^chrome-extension:\/\/[a-z]{32}$/;

function getAllowedOrigins(): string[] {
  const configuredOrigins = process.env['ALLOWED_ORIGINS']
    ?.split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0) ?? [];

  return Array.from(new Set([...DEFAULT_ALLOWED_ORIGINS, ...configuredOrigins]));
}

function isAllowedOrigin(origin: string): boolean {
  const allowedOrigins = getAllowedOrigins();

  return (
    allowedOrigins.includes('*') ||
    allowedOrigins.includes(origin) ||
    EXTENSION_ORIGIN_PATTERN.test(origin)
  );
}

/**
 * Create and configure Express application
 *
 * @returns {Application} Configured Express application
 */
export const createApp = (): Application => {
  const app = express();

  // ============================================
  // Security Middleware
  // ============================================

  // Helmet: Sets various HTTP headers to secure the app
  // Reference: https://helmetjs.github.io/
  app.use(helmet());

  // CORS: Enable Cross-Origin Resource Sharing
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (isDevelopment) return callback(null, true); // Allow any dev origin dynamically

        if (isAllowedOrigin(origin)) {
          return callback(null, true);
        }

        console.warn('Blocked request from disallowed CORS origin', { origin });
        return callback(null, false);
      },
      credentials: true,
    })
  );

  // ============================================
  // Logging Middleware
  // ============================================

  // Morgan: HTTP request logger
  // Use 'dev' format in development, 'combined' in production
  app.use(
    morgan(isDevelopment ? 'dev' : 'combined', {
      skip: (req: Request) => req.url === '/health', // Skip health check logs in production
    })
  );

  // ============================================
  // Body Parsing Middleware
  // ============================================

  // JSON body parser with size limit
  app.use(express.json({ limit: '10mb' }));

  // URL-encoded body parser
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ============================================
  // API Routes
  // ============================================

  // Mount API routes
  app.use(apiRouter);

  // Future routes will be imported and mounted here
  // Example: app.use('/api/v1/users', userRoutes);

  // ============================================
  // 404 Handler
  // ============================================

  // This must be placed after all other routes
  app.use(notFound);

  // ============================================
  // Error Handler
  // ============================================

  // This must be the last middleware
  app.use(errorHandler);

  return app;
};
