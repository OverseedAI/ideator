# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ideator is a startup incubation SaaS platform that helps entrepreneurs evaluate and develop business ideas through AI-powered analysis. It's a monorepo with a React frontend and Express backend, using PostgreSQL with Prisma ORM.

## Development Commands

### Setup
```bash
pnpm install                    # Install all dependencies
cd backend && pnpm run db:generate && pnpm run db:migrate  # Set up database
```

### Development
```bash
pnpm run dev                    # Run both frontend and backend concurrently
pnpm run dev:backend            # Backend only (http://localhost:3000)
pnpm run dev:frontend           # Frontend only (http://localhost:5173)
```

### Building
```bash
pnpm run build                  # Build both frontend and backend
pnpm run build:backend          # Backend only (TypeScript compilation)
pnpm run build:frontend         # Frontend only (Vite build with TypeScript check)
```

### Database (from backend/ directory)
```bash
pnpm run db:migrate             # Run migrations in development
pnpm run db:migrate:prod        # Deploy migrations to production
pnpm run db:generate            # Regenerate Prisma client
pnpm run db:studio              # Open Prisma Studio GUI
pnpm run db:seed                # Seed database
```

### Code Quality
```bash
pnpm run format                 # Format all TypeScript files
pnpm run format:check           # Check formatting without modifying
cd backend && pnpm run lint     # Lint backend
cd frontend && pnpm run lint    # Lint frontend
```

### Docker
```bash
pnpm run docker:dev             # Run development environment in Docker
pnpm run docker:build           # Build production Docker images
pnpm run docker:prod            # Run production containers
```

## Architecture

### Monorepo Structure
- **Root**: Contains shared package.json with workspace scripts
- **backend/**: Express API server
- **frontend/**: React SPA with Vite

### Backend Architecture

**Tech Stack**: Express, TypeScript, Prisma, Vercel AI SDK (OpenAI)

**Request Flow**:
1. Request hits Express middleware (helmet, cors, body parsing) in `app.ts`
2. Routes are versioned under `/api/v1/` (see `routes/v1/index.ts`)
3. Routes map to controllers which call services
4. Services contain business logic and interact with Prisma

**Key Patterns**:
- **Authentication**: JWT-based auth using middleware in `middleware/auth.ts`. Token extracted from `Authorization: Bearer <token>` header and decoded to add `req.user` to request.
- **Error Handling**: Custom `AppError` class for consistent error responses, handled by centralized error middleware
- **Async Handlers**: Express routes wrapped with async error handling
- **Validation**: Zod schemas for request validation
- **AI Integration**: Vercel AI SDK (`ai` package) with OpenAI model. Two methods:
  - `generateText()`: For unstructured text responses
  - `generateStructuredOutput()`: For type-safe JSON responses with Zod schemas

**Database Models** (schema.prisma):
- `User`: Authentication + profile data (JSON field storing expertise, funding, followers, LinkedIn)
- `Idea`: User's business ideas with status (pending, analyzing, completed, failed)
- `Analysis`: AI-generated analysis sections linked to ideas (7 types: education, swot, features, business_values, pmf, next_steps, viability)

**API Endpoints**:
- `/api/v1/auth/*`: Login, signup, get current user
- `/api/v1/profile`: Get/update user profile
- `/api/v1/ideas/*`: CRUD operations for ideas
- `/api/v1/ideas/:id/analyses`: Trigger analysis, get all analyses for an idea

**Analysis Flow** (analysisService.ts):
1. User submits idea → status: "pending"
2. Trigger analysis → status: "analyzing"
3. AI generates 7 section types sequentially, each saved as separate Analysis record
4. On completion → status: "completed" (or "failed" on error)
5. Each section uses structured output with Zod schemas defined in `ai/schemas.ts`

### Frontend Architecture

**Tech Stack**: React 18, TypeScript, React Router, Vite, TailwindCSS, Axios

**State Management**:
- **Auth**: Context-based (`useAuth` hook) with localStorage persistence
- **API State**: Direct API calls in components with local state (no global state library)

**Routing** (App.tsx):
- Public routes: `/login`, `/signup`
- Protected routes: All under `/app/*` with `AppLayout` wrapper
- Root `/` redirects to `/app`

**Key Patterns**:
- **Auth Flow**: `AuthProvider` context wraps entire app, provides user/token state and auth actions
- **Protected Routes**: `AppLayout` component checks auth state and redirects to login if not authenticated
- **API Service Layer**: Services in `services/` handle all API calls with axios
  - `api.ts`: Configured axios instance with base URL and token injection
  - Individual service files per domain (auth, ideas, profile)
- **Component Structure**:
  - `components/common/`: Reusable UI components (Button, Input, Card, etc.)
  - `components/layout/`: Layout components (AppLayout, Sidebar)
  - `components/dashboard/`, `components/idea/`: Feature-specific components
  - `pages/`: Top-level route components

**Idea Detail Page Flow**:
1. Fetch idea and analyses on mount
2. Display sections conditionally based on status (pending, analyzing, completed, failed)
3. Poll for updates while status is "analyzing"
4. Render each analysis section using dedicated section components

## Important Conventions

### Backend
- Use Prisma for all database operations (never raw SQL)
- Wrap async Express handlers with error handling
- Use `AppError` for operational errors (e.g., 404, 401)
- Keep AI prompts in `ai/prompts.ts` and Zod schemas in `ai/schemas.ts`
- Controllers are thin layers that validate input and call services
- Services contain business logic and return data (don't handle HTTP responses)

### Frontend
- Use `useAuth()` hook to access authentication state
- API calls should go through service layer, not directly in components
- Use TypeScript types from `types/index.ts` for API responses
- TailwindCSS for all styling (no CSS modules or styled-components)
- Use `cn()` utility for conditional className merging

### Database
- Always run `pnpm run db:generate` after schema changes
- Use `pnpm run db:migrate` (not `npx prisma migrate`) for consistency with package.json scripts
- Profile data is stored as JSON in User.profileData field (flexible structure)
- Analysis content is stored as JSON in Analysis.content field (structure varies by sectionType)

## Environment Variables

### Backend (.env in backend/)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT signing
- `OPENAI_API_KEY`: OpenAI API key for AI SDK
- `CORS_ALLOWED_ORIGINS`: Comma-separated allowed origins
- `PORT`: Server port (default 3000)

### Frontend (.env in frontend/)
- `VITE_API_URL`: Backend API URL (default http://localhost:3000)