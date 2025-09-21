/**
 * index.ts
 * App bootstrap: helmet, json body limit, raw body capture, request-id, logger, cors, routes, error handler, start.
 */
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { corsMiddleware } from './config/cors.js';
import { requestId } from './middleware/requestId.js';
import { logger } from './middleware/logger.js';
import health from './routes/health.js';
import transform from './routes/transform.js';
import oss from './routes/oss.js';
import { logError } from './middleware/logger.js';
import { toHttp } from './utils/errors.js';
const app = express();
// Capture raw JSON for HMAC signature verification
app.use(express.json({
    limit: '100kb',
    verify: (req, _res, buf) => { req.rawBody = buf.toString('utf8'); }
}));
app.use(helmet());
app.use(corsMiddleware);
app.use(requestId);
app.use(logger);
app.use(health);
app.use(transform);
app.use(oss);
// Global error handler: log detailed error (without bodies) and return mapped response
app.use((err, req, res, _next) => {
    logError(req, err);
    const { status, body } = toHttp(err);
    res.status(status).json(body);
});
app.listen(env.PORT, () => {
    console.log(`Server listening on :${env.PORT}`);
});
