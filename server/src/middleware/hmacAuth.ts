/**
 * hmacAuth.ts
 * Verifies HMAC signature for protected routes. Enforces ±60s clock skew and nonce replay defense (TTL 120s).
 */
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { env } from '../config/env.js';

const NONCE_TTL_MS = 120_000;
const SKEW_LIMIT_MS = 60_000;
const seenNonces = new Map<string, number>();

function timingSafeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function hmacAuth(req: Request & { rawBody?: string }, res: Response, next: NextFunction) {
  const ts = req.header('x-ts');
  const nonce = req.header('x-nonce');
  const signature = req.header('x-signature');
  if (!ts || !nonce || !signature) {
    return res.status(401).json({ error: 'Missing HMAC headers' });
  }

  const tsNum = Number(ts);
  if (!Number.isFinite(tsNum)) {
    return res.status(401).json({ error: 'Invalid timestamp' });
  }

  const now = Date.now();
  if (Math.abs(now - tsNum) > SKEW_LIMIT_MS) {
    return res.status(409).json({ error: 'Timestamp skew too large' });
  }

  // Nonce replay check with TTL
  const seenAt = seenNonces.get(nonce);
  if (seenAt && now - seenAt < NONCE_TTL_MS) {
    return res.status(409).json({ error: 'Nonce replay detected' });
  }

  const body = req.rawBody ?? '';
  const data = `${body}.${ts}.${nonce}`;
  const computed = crypto.createHmac('sha256', env.HMAC_SECRET).update(data).digest('hex');

  if (!timingSafeEqualHex(computed, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Store nonce with timestamp, schedule cleanup
  seenNonces.set(nonce, now);
  setTimeout(() => seenNonces.delete(nonce), NONCE_TTL_MS).unref?.();

  next();
}
