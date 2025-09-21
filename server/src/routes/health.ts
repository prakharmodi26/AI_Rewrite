/**
 * health.ts
 * GET /healthz – simple health check.
 */
import { Router } from 'express';

const router = Router();

router.get('/healthz', (_req, res) => {
  res.json({ ok: true });
});

export default router;
