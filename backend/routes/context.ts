import express, { Router } from 'express';
import multer from 'multer';
import { processFileForContext, saveContext, getContext, crawlWebsiteForContext, clearContext } from '../controllers/contextController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router: Router = express.Router();

// Configure multer for file uploads (in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'text/plain'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and TXT files are allowed'));
    }
  },
});

// Process file and extract context
router.post('/process', authenticateJWT, upload.single('file'), processFileForContext);

// Crawl website and extract context
router.post('/crawl', authenticateJWT, crawlWebsiteForContext);

// Save context for an agent
router.post('/save', authenticateJWT, saveContext);

// Get context for an agent
router.get('/:agentId', authenticateJWT, getContext);

// Clear context (specific or all)
router.delete('/:agentId/clear', authenticateJWT, clearContext);

export default router;
