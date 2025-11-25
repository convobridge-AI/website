import express from 'express';
import { getAgents, getAgent, createAgent, updateAgent, deleteAgent } from '../controllers/agentController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

// Protected: list all agents
router.get('/', authenticateJWT, getAgents);

// Protected: create an agent
router.post('/', authenticateJWT, createAgent);

// Protected: get single agent
router.get('/:id', authenticateJWT, getAgent);

// Protected: update agent
router.put('/:id', authenticateJWT, updateAgent);

// Protected: delete agent
router.delete('/:id', authenticateJWT, deleteAgent);

export default router;
