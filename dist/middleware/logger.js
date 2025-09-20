/**
 * logger.ts
 * Minimal request logger using morgan. Logs id, method, path, status, latency.
 * Never logs bodies.
 */
import morgan from 'morgan';
morgan.token('id', (req) => req.id ?? '-');
export const logger = morgan('[:id] :method :url :status :response-time[3] ms');
