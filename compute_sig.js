#!/usr/bin/env node
/**
 * compute_sig.js (ESM)
 * Dev helper to compute HMAC-SHA256 signature for requests to the server.
 * Usage: node compute_sig.js '<BODY_JSON>' <TS_MS> <NONCE>
 * Reads HMAC_SECRET from environment (.env via dotenv is supported).
 */
import 'dotenv/config';
import { createHmac } from 'node:crypto';

function loadEnvSecret() {
  if (process.env.HMAC_SECRET) return process.env.HMAC_SECRET;
  console.error('HMAC_SECRET not found in environment');
  process.exit(2);
}

if (process.argv.length < 5) {
  console.error('Usage: node compute_sig.js "<BODY_JSON>" <TS_MS> <NONCE>');
  process.exit(2);
}

const body = process.argv[2];
const ts = process.argv[3];
const nonce = process.argv[4];
const secret = loadEnvSecret();
const data = `${body}.${ts}.${nonce}`;
const sig = createHmac('sha256', secret).update(data).digest('hex');
console.log(sig);
