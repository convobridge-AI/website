import express, { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import {
  getSystemStats,
  getAllUsers,
  updateUser,
  getAllAgents,
  getAllCalls,
} from '../controllers/adminController.js';

const router: Router = express.Router();

// Admin-only middleware
const isAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Apply authentication and admin check to all routes
router.use(authenticateJWT);
router.use(isAdmin);

// System stats
router.get('/stats', getSystemStats);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);

// Agent management
router.get('/agents', getAllAgents);

// Call management
router.get('/calls', getAllCalls);

export default router;
