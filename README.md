# Sales Floor System - Backend

Backend API for the Sales Floor Management System.

## Tech Stack

- Node.js + Express
- PostgreSQL + Prisma ORM
- RESTful API

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database URL
```

3. Run database migrations:
```bash
npm run prisma:migrate
```

4. Generate Prisma client:
```bash
npm run prisma:generate
```

5. Start the server:
```bash
npm run dev  # Development
npm start    # Production
```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS

## API Endpoints

- `GET /health` - Health check
- `POST /api/agents` - Create or get agent
- `GET /api/agents/:id` - Get agent by ID
- `PATCH /api/agents/:id` - Update agent
- `POST /api/passups` - Create pass-up
- `GET /api/passups/agent/:agentId` - Get agent's pass-ups
- `GET /api/passups/agent/:agentId/stats` - Get agent stats
- `GET /api/leaderboard` - Get leaderboard
- `GET /api/stock/quote` - Get stock quote
- `POST /api/breaks` - Start break
- `PATCH /api/breaks/:id` - End break

## Deployment

See `DEPLOYMENT.md` for deployment instructions.

