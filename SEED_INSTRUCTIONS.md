# Database Seeding Instructions

## Prerequisites

1. Make sure you have a `.env` file in the `backend/` directory with your `DATABASE_URL`:
   ```
   DATABASE_URL=your-postgresql-connection-string
   ```

2. Make sure Prisma Client is generated:
   ```bash
   cd backend
   npm install
   npm run prisma:generate
   ```

## Running the Seed Script

To seed your database with initial data:

```bash
cd backend
npm run prisma:seed
```

Or directly:
```bash
cd backend
node prisma/seed.js
```

## What the Seed Script Does

The seed script will:

1. **Clear existing data** (optional - currently enabled):
   - Deletes all PassUps
   - Deletes all Breaks
   - Deletes all Agents
   - Deletes all GlobalScripts

2. **Create initial data**:
   - 3 Agents: "Neon", "Alex", "Jordan"
   - 1 GlobalScript with default content
   - 4 Sample PassUps (3 for Neon, 1 for Alex)
   - 2 Sample Breaks (for Neon agent)

## Customizing the Seed Data

Edit `backend/prisma/seed.js` to customize:
- Number of agents
- Agent names
- Sample pass-ups data
- Sample breaks data
- Global script content

## Important Notes

⚠️ **The seed script will DELETE all existing data** before inserting new data. If you want to preserve existing data, comment out the deletion section in `seed.js` (lines starting with `await prisma.*.deleteMany()`).

