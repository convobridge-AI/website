import express from 'express';
import { getCalls, getCall, createCall, updateCall, deleteCall, getCallStats } from '../controllers/callController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

// Protected: list all calls
router.get('/', authenticateJWT, getCalls);

// Protected: get call stats
router.get('/stats', authenticateJWT, getCallStats);

// Protected: create a call
router.post('/', authenticateJWT, createCall);

// Protected: get single call
router.get('/:id', authenticateJWT, getCall);

// Protected: update call
router.put('/:id', authenticateJWT, updateCall);

// Protected: delete call
router.delete('/:id', authenticateJWT, deleteCall);

export default router;
