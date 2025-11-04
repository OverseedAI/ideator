# Ideator Setup Guide

This guide will help you set up and run the Ideator application locally or in production.

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 8.0.0
- Docker and docker-compose (optional, for containerized deployment)
- PostgreSQL (if running without Docker)
- OpenAI API key

## Quick Start (Docker)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ideator
   ```

2. **Set up environment variables**
   ```bash
   # Create .env file in root with your OpenAI API key
   echo "OPENAI_API_KEY=your-api-key-here" > .env
   ```

3. **Start the application**
   ```bash
   docker-compose up
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Health check: http://localhost:3000/health

## Local Development Setup

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your configuration
   ```

4. **Set up database**
   ```bash
   # Make sure PostgreSQL is running
   pnpm run db:generate
   pnpm run db:migrate
   ```

5. **Start development server**
   ```bash
   pnpm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env if needed (default points to localhost:3000)
   ```

4. **Start development server**
   ```bash
   pnpm run dev
   ```

## Production Deployment

1. **Set up production environment variables**
   ```bash
   cp .env.production.example .env.production
   # Edit .env.production with your production values
   ```

2. **Build and start production containers**
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
   ```

3. **Run database migrations**
   ```bash
   docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
   ```

## Environment Variables

### Backend (.env)

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens (min 32 characters)
- `JWT_EXPIRES_IN` - Token expiration time (default: 7d)
- `OPENAI_API_KEY` - Your OpenAI API key
- `AI_MODEL` - AI model to use (default: gpt-4o)
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins

### Frontend (.env)

- `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:3000/api/v1)

## Database Management

### Create a migration
```bash
cd backend
pnpm run db:migrate
```

### View database in Prisma Studio
```bash
cd backend
pnpm run db:studio
```

### Reset database (development only)
```bash
cd backend
npx prisma migrate reset
```

## API Documentation

### Authentication Endpoints

- `POST /api/v1/auth/signup` - Create new account
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user

### Profile Endpoints

- `GET /api/v1/profile` - Get user profile
- `PUT /api/v1/profile` - Update user profile

### Idea Endpoints

- `POST /api/v1/ideas` - Create new idea
- `GET /api/v1/ideas` - Get all user ideas
- `GET /api/v1/ideas/:id` - Get idea by ID
- `PUT /api/v1/ideas/:id` - Update idea
- `DELETE /api/v1/ideas/:id` - Delete idea

### Analysis Endpoints

- `POST /api/v1/ideas/:id/analyze` - Trigger AI analysis
- `GET /api/v1/ideas/:id/analyses` - Get all analyses for an idea

## Troubleshooting

### Port already in use
If ports 3000 or 5173 are already in use, you can change them in:
- Backend: `backend/.env` (PORT variable)
- Frontend: `frontend/vite.config.ts` (server.port)

### Database connection issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in backend/.env
- Verify database credentials

### OpenAI API errors
- Verify your OPENAI_API_KEY is valid
- Check your OpenAI account has credits
- Ensure the AI_MODEL specified is available to your account

## Development Tips

- Use `pnpm run dev` in root to start both frontend and backend
- Backend uses hot reload with tsx watch
- Frontend uses Vite HMR for instant updates
- Check backend logs for API errors
- Use browser DevTools for frontend debugging

## Support

For issues or questions:
- Check the README.md
- Review the API documentation
- Check application logs
