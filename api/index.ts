import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from '../backend/config/db.js';
import { errorHandler } from '../backend/middleware/errorHandler.js';

// Routes
import authRoutes from '../backend/routes/auth.js';
import agentRoutes from '../backend/routes/agents.js';
import callRoutes from '../backend/routes/calls.js';
import contactRoutes from '../backend/routes/contacts.js';
import contextRoutes from '../backend/routes/context.js';
import leadRoutes from '../backend/routes/leads.js';

dotenv.config();

const app: Express = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Connect DB
connectDB().catch(console.error);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/context', contextRoutes);
app.use('/api/leads', leadRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
