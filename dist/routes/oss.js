/**
 * oss.ts
 * POST /oss/transform returns 501 (placeholder for future OSS provider).
 */
import { Router } from 'express';
import { rateLimit } from '../middleware/rateLimit.js';
import { hmacAuth } from '../middleware/hmacAuth.js';
const router = Router();
router.post('/oss/transform', rateLimit, hmacAuth, (_req, res) => {
    res.status(501).json({ error: 'OSS provider not implemented yet' });
});
export default router;
