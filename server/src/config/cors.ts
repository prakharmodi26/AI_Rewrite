/**
 * cors.ts
 * Builds a strict CORS middleware allowing only configured origins.
 */
import cors from 'cors';
import { env } from './env.js';

const options = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow non-browser clients (no Origin) and configured origins only
    if (!origin) return callback(null, true);
    if (env.ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: false,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-ts', 'x-nonce', 'x-signature', 'x-install-id']
};

export const corsMiddleware = cors(options);
