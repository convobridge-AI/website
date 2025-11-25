import express from 'express';
import { getLeads, getLead, createLead, updateLead, deleteLead, getLeadStats } from '../controllers/leadController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateJWT, getLeads);
router.get('/stats', authenticateJWT, getLeadStats);
router.get('/:id', authenticateJWT, getLead);
router.post('/', authenticateJWT, createLead);
router.put('/:id', authenticateJWT, updateLead);
router.delete('/:id', authenticateJWT, deleteLead);

export default router;
