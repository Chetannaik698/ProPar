import { Router } from 'express';
import { analyzePrompt } from '../controllers/analysis.controller.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.post('/analyze', asyncHandler(analyzePrompt));

export const analysisRoutes = router;
