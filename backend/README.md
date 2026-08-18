# ProPar Backend API

Production-ready backend foundation for ProPar - AI Thinking Partner.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [API Endpoints](#api-endpoints)
- [Health Check](#health-check)
- [Development](#development)
- [Architecture](#architecture)
- [Coding Principles](#coding-principles)

## Overview

ProPar Backend is a clean, production-ready Express.js API built with TypeScript and MongoDB. It provides a solid foundation for the ProPar AI Thinking Partner application with proper error handling, security middleware, and database connection management.

**Current Milestone:** Milestone 2 - Backend Foundation

**Status:** Foundation complete - No business logic, AI integration, or authentication yet.

## Technology Stack

- **Runtime:** Node.js (>=18.0.0)
- **Framework:** Express.js
- **Language:** TypeScript (strict mode)
- **Database:** MongoDB with Mongoose ODM
- **Validation:** Zod
- **Security:** Helmet, CORS
- **Logging:** Morgan
- **AI Provider:** Google AI Studio Gemini API
- **Development:** tsx, nodemon
- **Code Quality:** ESLint, Prettier

## Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── db.ts           # MongoDB connection utility
│   │   └── env.ts          # Environment variable loader and validator
│   │
│   ├── controllers/         # Request handlers (empty for now)
│   │
│   ├── middleware/          # Express middleware
│   │   ├── errorHandler.ts # Centralized error handling
│   │   └── notFound.ts     # 404 handler
│   │
│   ├── models/              # Mongoose models (empty for now)
│   │
│   ├── prompts/             # Prompt-related logic (empty for now)
│   │
│   ├── routes/              # API route definitions
│   │   └── index.ts        # Route aggregator
│   │
│   ├── services/            # Business logic layer (empty for now)
│   │
│   ├── utils/               # Utility functions (empty for now)
│   │
│   ├── app.ts              # Express app configuration
│   └── server.ts           # Server entry point
│
├── .env.example             # Environment variable template
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── eslint.config.js         # ESLint rules
├── prettier.config.js       # Prettier formatting rules
└── README.md                # This file
```

### Folder Explanations

- **config/**: Application configuration (database, environment variables)
- **controllers/**: Handle HTTP requests and responses (will be added in future milestones)
- **middleware/**: Express middleware for error handling, authentication, etc.
- **models/**: Mongoose schemas and models (will be added when database schemas are defined)
- **prompts/**: Prompt analysis and processing logic (will be added in future milestones)
- **routes/**: API route definitions and organization
- **services/**: Business logic layer (separates concerns from controllers)
- **utils/**: Reusable utility functions and helpers

## Installation

### Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 5.0 (local or Atlas)
- pnpm (recommended) or npm

### Steps

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   # Copy the example environment file
   cp .env.example .env

   # Edit .env with your configuration
   # At minimum, set MONGODB_URI
   ```

4. **Verify TypeScript configuration:**
   ```bash
   pnpm typecheck
   # or
   npm run typecheck
   ```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENROUTER_API_KEY` | OpenRouter API key used for analysis | `sk-or-...` |

### Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port number | `5000` |
| `NODE_ENV` | Environment mode | `development`, `production`, or `test` |
| `MONGODB_URI` | Optional MongoDB connection string. Prompt analysis works without it. | `mongodb://localhost:27017/propar` |
| `OPENROUTER_MODEL` | Primary OpenRouter model id | `google/gemini-2.5-flash` |
| `OPENROUTER_FALLBACK_MODELS` | Comma-separated fallback model ids. Used only after provider/model failures. | `google/gemini-2.0-flash` |
| `AI_REQUEST_TIMEOUT_MS` | Provider request timeout | `30000` |
| `AI_MAX_COMPLETION_TOKENS` | Maximum provider completion tokens | `6000` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins (production) | `https://propaar.netlify.app` |

### Environment Variable Validation

The application uses Zod for runtime validation of environment variables. If required variables are missing or invalid, the server will fail to start with a clear error message.

## Running Locally

### Development Mode

Start the server with auto-reload using tsx:

```bash
pnpm dev
# or
npm run dev
```

The server will:
- Start on `http://localhost:5000` (or your configured PORT)
- Auto-reload when files change
- Connect to MongoDB (if available)
- Continue running even if MongoDB is unavailable

### API Endpoints

#### POST /api/v1/analyze

Analyze a prompt using the ProPar thinking framework and OpenRouter provider.

Request body:

```json
{
  "prompt": "Build an e-commerce website"
}
```

Success response:

```json
{
  "success": true,
  "analysis": {
    "intent": "Website Development",
    "thinkingGap": "...",
    "missingContext": ["..."],
    "hiddenAssumptions": ["..."],
    "suggestions": ["..."],
    "thinkingScore": 78,
    "estimatedImprovement": "+42%",
    "improvedPrompt": "..."
  },
  "meta": {
    "provider": "mock",
    "model": "none",
    "processingTime": "10ms",
    "version": "v1"
  }
}
```

Validation rules:
- `prompt` is required
- `prompt` must be a string
- `prompt` is trimmed
- Minimum length: 3
- Maximum length: 10000
- Empty prompts are rejected

Error response:

```json
{
  "success": false,
  "error": {
    "message": "prompt: Prompt must be at least 3 characters long.",
    "code": "VALIDATION_ERROR",
    "statusCode": 400
  }
}
```

### Production Mode

1. **Build the application:**
   ```bash
   pnpm build
   # or
   npm run build
   ```

2. **Start the server:**
   ```bash
   pnpm start
   # or
   npm start
   ```

### Other Scripts

```bash
# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Check TypeScript types without building
pnpm typecheck

# Format code with Prettier
pnpm format

# Check code formatting
pnpm format:check
```

## API Endpoints

### Base URL

```
http://localhost:5000
```

### Endpoints

#### GET /

Get API information.

**Response:**
```json
{
  "name": "ProPar API",
  "version": "1.0.0",
  "status": "running"
}
```

#### GET /health

Health check endpoint - Returns server and database status.

**Response:**
```json
{
  "status": "ok",
  "server": "running",
  "database": "connected",
  "uptime": "1h 23m 45s",
  "details": {
    "database": {
      "status": "connected",
      "database": "propar",
      "host": "localhost:27017",
      "attempts": 0
    },
    "environment": "development",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

**Database Status Values:**
- `connected` - MongoDB is connected and ready
- `disconnected` - MongoDB is not connected
- `connecting` - MongoDB connection in progress
- `disconnecting` - MongoDB disconnection in progress

## Health Check

The `/health` endpoint provides real-time health information:

- **Server Status:** Always "running" if the endpoint responds
- **Database Status:** Dynamically checks MongoDB connection state
- **Uptime:** Human-readable format (e.g., "2d 5h 30m 15s")
- **Environment:** Current NODE_ENV
- **Timestamp:** ISO 8601 timestamp of the check

### Database Connection Behavior

The server is designed to be resilient:

- ✅ **MongoDB available:** Server connects and logs success
- ⚠️ **MongoDB unavailable:** Server continues running, logs warning
- 🔄 **Connection lost:** Server attempts to reconnect
- 🛑 **Max attempts reached:** Server stops trying, continues without DB

This ensures the API remains available even if the database is temporarily down.

## Development

### Code Quality

This project enforces strict code quality standards:

- **TypeScript:** Strict mode enabled with no `any` types
- **ESLint:** Enforces best practices and catches errors
- **Prettier:** Automatic code formatting
- **Type Checking:** Run `pnpm typecheck` before committing

### Adding New Features

1. **Create Models:** Define Mongoose schemas in `src/models/`
2. **Create Services:** Implement business logic in `src/services/`
3. **Create Controllers:** Handle HTTP requests in `src/controllers/`
4. **Create Routes:** Define API routes in `src/routes/`
5. **Mount Routes:** Import and mount routes in `src/app.ts`

### Error Handling

Use the provided error handling utilities:

```typescript
import { AppError, asyncHandler } from '../middleware/errorHandler';

// Throw application errors
throw new AppError('User not found', 404);

// Wrap async handlers
router.get('/users', asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json({ success: true, data: users });
}));
```

## Architecture

### Design Patterns

This backend follows **Clean Architecture** principles:

- **Separation of Concerns:** Each layer has a specific responsibility
- **Dependency Injection:** Dependencies are passed, not imported
- **Single Responsibility:** Each module does one thing well
- **DRY (Don't Repeat Yourself):** Reusable utilities and middleware

### Request Flow

```
Request
  ↓
Helmet (Security headers)
  ↓
CORS (Cross-origin requests)
  ↓
Morgan (Logging)
  ↓
Body Parser (JSON/URL-encoded)
  ↓
Routes (Controller → Service → Model)
  ↓
404 Handler (if no route matched)
  ↓
Error Handler (if error occurred)
  ↓
Response
```

### Key Architectural Decisions

1. **Centralized Error Handling:** All errors are caught and formatted consistently
2. **Async Handler Wrapper:** Eliminates repetitive try-catch blocks
3. **Graceful Database Connection:** Server doesn't crash if DB is down
4. **Environment Validation:** Early failure with clear error messages
5. **Health Check Endpoint:** Real-time monitoring of server and database
6. **Strict TypeScript:** Catches errors at compile time
7. **Modular Structure:** Easy to test, maintain, and scale

## Coding Principles

### Core Principles

1. **Clean Architecture:** Separation of concerns, dependency injection
2. **Single Responsibility Principle (SRP):** Each module has one job
3. **Small Reusable Modules:** Functions and utilities are focused and composable
4. **Production-Ready Code:** Error handling, logging, security, monitoring
5. **Focused Business Logic:** AI prompt analysis is implemented; auth and persistence are not part of the current flow
6. **Type Safety:** Strict TypeScript, no `any` types, proper interfaces
7. **Async/Await Only:** No callbacks, modern JavaScript patterns
8. **Documentation:** JSDoc comments for all public functions

### Code Style

- **Formatting:** Prettier (2 spaces, single quotes, semicolons)
- **Naming:** camelCase for variables/functions, PascalCase for classes
- **Imports:** Organized by type (builtin, external, internal)
- **Error Messages:** Clear, actionable, user-friendly
- **Comments:** Explain "why", not "what"

### Current Scope

The current backend implements the prompt analysis API, OpenRouter integration, health checks, and validation. These areas are intentionally outside the current implementation:

- Authentication and authorization
- User models or sessions
- Prompt history persistence
- Database-backed product workflows

## Next Steps

Future milestones may add:

1. **Milestone 3:** User authentication and authorization
2. **Milestone 4:** Prompt history and database schemas
3. **Milestone 5:** User preferences and saved prompt profiles
4. **Milestone 6:** Additional provider observability
5. **Milestone 7:** Team workflows and analytics

## License

MIT

## Support

For issues or questions, please contact the ProPar team.

---

**Built with ❤️ by the ProPar Team**
