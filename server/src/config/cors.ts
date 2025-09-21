/**
 * cors.ts
 * Allow-all CORS for development: accepts any Origin and preflight.
 * Tighten before production.
 */
import cors from 'cors';

export const corsMiddleware = cors({
  origin: true, // reflect the request origin, as defined by the request header
  credentials: false,
  methods: ['GET', 'POST', 'OPTIONS'],
  // Mirror requested headers automatically; include common custom headers explicitly
  allowedHeaders: ['Content-Type', 'x-ts', 'x-nonce', 'x-signature', 'x-install-id'],
  optionsSuccessStatus: 204
});
