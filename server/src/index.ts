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

const app = express();

// Capture raw JSON for HMAC signature verification
app.use(express.json({
  limit: '100kb',
  verify: (req: any, _res, buf: Buffer) => { req.rawBody = buf.toString('utf8'); }
}));

app.use(helmet());
app.use(corsMiddleware);
app.use(requestId);
app.use(logger);

app.use(health);
app.use(transform);
app.use(oss);

// Global error handler (hide internals)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[error]', err?.name || 'Error');
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(env.PORT, () => {
  console.log(`Server listening on :${env.PORT}`);
});
