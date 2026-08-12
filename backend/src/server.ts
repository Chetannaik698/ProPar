/**
 * Server entry point
 *
 * This file initializes the Express server, connects to MongoDB,
 * and starts listening for requests. It handles graceful shutdown
 * and startup errors.
 *
 * @module server
 */

import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';

/**
 * Application instance
 */
let app = createApp();

/**
 * Start the server
 *
 * This function initializes the server, connects to the database,
 * and starts listening for requests.
 *
 * @returns {Promise<void>}
 */
export const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB (non-blocking - server will start even if DB is down)
    const dbConnected = await connectDB();

    if (!dbConnected) {
      console.warn('⚠️  Server started without database connection');
      console.warn('   Some features may not work until database is available');
    }

    // Start Express server
    const PORT = env.PORT;

    const server = app.listen(PORT, () => {
      console.log('🚀 ProPar API Server started successfully');
      console.log(`   Environment: ${env.NODE_ENV}`);
      console.log(`   Port: ${PORT}`);
      console.log(`   URL: http://localhost:${PORT}`);
      console.log(`   Database: ${dbConnected ? 'Connected' : 'Disconnected'}`);
      console.log(`   Health: http://localhost:${PORT}/health`);
      console.log('');
      console.log('📋 Available endpoints:');
      console.log(`   GET  /        - API information`);
      console.log(`   GET  /health  - Health check`);
      console.log('');
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.error(`   Try using a different port or stop the process using port ${PORT}`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', error);
        process.exit(1);
      }
    });

    // ============================================
    // Graceful Shutdown Handlers
    // ============================================

    /**
     * Graceful shutdown handler
     * Closes the server and database connection gracefully
     */
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);

      // Stop accepting new connections
      server.close(() => {
        console.log('✅ HTTP server closed');
      });

      // Disconnect from database
      await disconnectDB();

      console.log('👋 Graceful shutdown complete');
      process.exit(0);
    };

    // Handle termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      console.error('❌ Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: unknown) => {
      console.error('❌ Unhandled Rejection:', reason);
      gracefulShutdown('unhandledRejection');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start server if this file is run directly
// Make the check robust for different runners (tsx, node) and Windows paths
const _isMain = (() => {
  try {
    const entryArg = process.argv[1];
    // If no argv[1] is provided (some runners), assume this is the main module
    if (!entryArg) return true;

    // Exact match (file:// path) or endsWith for path differences across runtimes
    if (import.meta.url === `file://${entryArg}`) return true;
    if (import.meta.url.endsWith(entryArg)) return true;

    // Heuristic: if the entry argument ends with the script filename, treat as main
    if (entryArg.endsWith('/src/server.ts') || entryArg.endsWith('\\src\\server.ts')) return true;
    if (entryArg.endsWith('/dist/server.js') || entryArg.endsWith('\\dist\\server.js')) return true;

    return false;
  } catch (err) {
    return true;
  }
})();

if (_isMain) {
  startServer();
}

export default app;
// Force tsx watch reload to read updated .env with Gemini 3.1 Flash Lite model

