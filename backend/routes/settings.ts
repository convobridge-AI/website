import express, { Router } from 'express';
import {
  getSettings,
  updateSettings,
  regenerateApiKey,
  connectIntegration,
  disconnectIntegration,
} from '../controllers/settingsController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router: Router = express.Router();

router.get('/', authenticateJWT, getSettings);
router.put('/', authenticateJWT, updateSettings);
router.post('/regenerate-api-key', authenticateJWT, regenerateApiKey);
router.post('/integrations/:name/connect', authenticateJWT, connectIntegration);
router.delete('/integrations/:name', authenticateJWT, disconnectIntegration);

export default router;
