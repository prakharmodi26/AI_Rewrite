import { randomUUID } from 'crypto';
export function requestId(_req, _res, next) {
    // Use crypto.randomUUID() available in Node 20+ for stable UUID generation.
    _req.id = randomUUID();
    next();
}
