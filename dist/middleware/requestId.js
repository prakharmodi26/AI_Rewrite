import { randomUUID } from 'crypto';
export function requestId(_req, _res, next) {
    // Use crypto.randomUUID() available in Node 20+ for stable UUID generation.
    _req.id = randomUUID();
    // Attach a simple start timestamp for latency calculations in custom logs
    _req._startTime = Date.now();
    next();
}
