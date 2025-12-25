# How to Start the Backend Server

## Quick Start

1. **Navigate to backend directory:**
   ```powershell
   cd backend
   ```

2. **Install dependencies (if not already done):**
   ```powershell
   npm install
   ```

3. **Make sure you have a `.env` file with your DATABASE_URL:**
   ```powershell
   # Check if .env exists
   Test-Path .env
   
   # If it doesn't exist, create it:
   # DATABASE_URL=your-neon-database-connection-string
   ```

4. **Generate Prisma Client (if needed):**
   ```powershell
   npm run prisma:generate
   ```

5. **Start the development server:**
   ```powershell
   npm run dev
   ```

   Or for production:
   ```powershell
   npm start
   ```

## Expected Output

You should see:
```
🚀 Server running on http://localhost:3001
📊 Environment: development
```

## Troubleshooting

### Port 3001 Already in Use
If you get an error that port 3001 is already in use:
- Check what's using it: `netstat -ano | findstr :3001`
- Kill the process or change the PORT in `.env`

### Database Connection Issues
- Make sure your `DATABASE_URL` in `.env` is correct
- Test the connection string in Neon console

### Missing Dependencies
- Run `npm install` again
- Make sure Node.js version is compatible (Node 18+)

