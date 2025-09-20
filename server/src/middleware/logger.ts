/**
 * logger.ts
 * Minimal request logger using morgan. Logs id, method, path, status, latency.
 * Never logs bodies.
 */
import morgan from 'morgan';
import type { Request } from 'express';

morgan.token('id', (req: Request & { id?: string }) => req.id ?? '-');

export const logger = morgan('[:id] :method :url :status :response-time[3] ms');
