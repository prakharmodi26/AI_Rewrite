/**
 * time.ts
 * Time helpers for safe now() and skew checks.
 */

export const nowMs = () => Date.now();

export function withinSkew(tsMs: number, skewMs: number, ref: number = nowMs()) {
  return Math.abs(ref - tsMs) <= skewMs;
}
