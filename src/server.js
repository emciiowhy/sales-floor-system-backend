import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { appendFileSync } from 'fs';
import agentRoutes from './routes/agents.js';
import passUpRoutes from './routes/passups.js';
import leaderboardRoutes from './routes/leaderboard.js';
import stockRoutes from './routes/stock.js';
import breakRoutes from './routes/breaks.js';
import breakScheduleRoutes from './routes/breakSchedules.js';

dotenv.config();

const app = express();
// Parse PORT as integer, default to 3001 if invalid or not set
// Handle cases where PORT might be set to a URL (e.g., from Render deployment config)
let PORT = 3001; // Default port

if (process.env.PORT) {
  const portValue = process.env.PORT.trim();
  // Check if it's a URL (contains http:// or https://)
  if (portValue.includes('http://') || portValue.includes('https://')) {
    console.warn(`PORT environment variable contains a URL (${portValue}). Using default port 3001 for local development.`);
  } else {
    const parsedPort = parseInt(portValue, 10);
    if (!isNaN(parsedPort) && parsedPort >= 1 && parsedPort <= 65535) {
      PORT = parsedPort;
    } else {
      console.warn(`Invalid PORT value: ${portValue}. Using default port 3001.`);
    }
  }
}

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'https://sales-floor-system-frontend-68yiysley-emciiowhys-projects.vercel.app',
  'https://sales-floor-system-frontend.vercel.app'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/agents', agentRoutes);
app.use('/api/passups', passUpRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/breaks', breakRoutes);
// #region agent log
const logData = {location:'server.js:73',message:'Registering break-schedules route',data:{routePath:'/api/break-schedules',breakScheduleRoutesExists:!!breakScheduleRoutes},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'};
appendFileSync('c:\\Users\\Admin\\sales-floor-system\\.cursor\\debug.log', JSON.stringify(logData) + '\n');
// #endregion
app.use('/api/break-schedules', breakScheduleRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});