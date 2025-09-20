/**
 * requestId.ts
 * Attaches a stable req.id (uuid v4) for request-scoped logging.
 */
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export function requestId(_req: Request & { id?: string }, _res: Response, next: NextFunction) {
  // Use crypto.randomUUID() available in Node 20+ for stable UUID generation.
  (_req as any).id = randomUUID();
  next();
}
