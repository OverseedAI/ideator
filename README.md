# Ideator

A startup incubation SaaS platform that helps entrepreneurs evaluate and develop business ideas through AI-powered analysis.

## Features

- **User Profiles**: Personalized context with expertise, funding, and background
- **Idea Submission**: Simple interface to submit business ideas
- **AI Analysis**:
  - Product space education and terminology
  - SWOT analysis tailored to user profile
  - Feature set analysis with competitive comparison
  - Business values identification (moats, target market, pricing)
  - Product-market fit strategies
  - Next steps recommendations
  - Viability scoring

## Tech Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **AI**: Vercel AI SDK
- **Deployment**: Docker, docker-compose

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- Docker and docker-compose (for containerized deployment)
- PostgreSQL (if running locally without Docker)

### Development

1. Clone the repository:
```bash
git clone <repository-url>
cd ideator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Backend (.env in backend/)
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Frontend (.env in frontend/)
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your configuration
```

4. Run database migrations:
```bash
cd backend
npm run db:migrate
cd ..
```

5. Start development servers:
```bash
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:3000

### Docker Development

```bash
npm run docker:dev
```

### Production Deployment

1. Build production images:
```bash
npm run docker:build
```

2. Start production containers:
```bash
npm run docker:prod
```

## Project Structure

```
ideator/
├── backend/          # Express backend
├── frontend/         # React frontend
├── docker-compose.yml
├── docker-compose.prod.yml
└── package.json
```

## API Documentation

API endpoints are versioned under `/api/v1/`:

- **Auth**: `/api/v1/auth/*`
- **Profile**: `/api/v1/profile`
- **Ideas**: `/api/v1/ideas/*`
- **Analysis**: `/api/v1/ideas/:id/analyses`

## License

MIT
