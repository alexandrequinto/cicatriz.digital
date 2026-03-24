import { createHmac, timingSafeEqual } from 'crypto';
import type { BirthData } from '@/types/astro';

// HMAC_SECRET must be set in Vercel project settings (environment variables).
// In production, unsigned tokens are still accepted for backward compatibility,
// but new tokens will always be signed. If HMAC_SECRET is absent (local dev),
// verification is skipped and a warning is logged.

type Payload = {
  n: string;
  d: string;
  t: string;
  a: number;
  o: number;
  z: string;
  c: string;
  f?: number; // event category filter bitmask (absent = all enabled)
};

export const FILTER_BITS = {
  'outer-transit': 1,
  'inner-transit': 2,
  'lunar': 4,
  'ingress': 8,
  'retrograde': 16,
} as const;

export const ALL_FILTERS = 31; // all 5 bits set

function toBase64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Signs a base64url payload string with HMAC-SHA256.
 * Returns `<payload>.<base64url_signature>`.
 */
export function signToken(payload: string): string {
  const secret = process.env.HMAC_SECRET;
  if (!secret) {
    // Dev convenience: if no secret is configured, return unsigned token.
    console.warn('[birthData] HMAC_SECRET is not set — token will not be signed.');
    return payload;
  }
  const sig = createHmac('sha256', secret).update(payload).digest();
  return `${payload}.${toBase64url(sig)}`;
}

/**
 * Verifies a token (signed or legacy unsigned).
 * - Signed tokens (`payload.sig`): verifies the HMAC; throws if invalid.
 * - Legacy tokens (no dot): accepted silently, returns `legacy: true`.
 * - If HMAC_SECRET is absent: skips verification and returns `legacy: false`.
 *
 * Returns `{ payload, legacy }` where `payload` is the base64url-encoded JSON part.
 */
export function verifyToken(token: string): { payload: string; legacy: boolean } {
  const dotIndex = token.lastIndexOf('.');
  if (dotIndex === -1) {
    // Legacy unsigned token — accept forever (no user contact mechanism exists).
    return { payload: token, legacy: true };
  }

  const payload = token.slice(0, dotIndex);
  const receivedSig = token.slice(dotIndex + 1);

  const secret = process.env.HMAC_SECRET;
  if (!secret) {
    // Dev fallback: skip verification when secret is absent.
    console.warn('[birthData] HMAC_SECRET is not set — skipping token signature verification.');
    return { payload, legacy: false };
  }

  const expectedSigBuf = createHmac('sha256', secret).update(payload).digest();
  const expectedSig = toBase64url(expectedSigBuf);

  // Use timing-safe comparison to prevent timing attacks.
  const receivedBuf = Buffer.from(receivedSig);
  const expectedBuf = Buffer.from(expectedSig);
  const valid =
    receivedBuf.length === expectedBuf.length &&
    timingSafeEqual(receivedBuf, expectedBuf);

  if (!valid) {
    throw new Error('Invalid token signature');
  }

  return { payload, legacy: false };
}

export function encodeBirthData(data: BirthData): string {
  const payload: Payload = {
    n: data.name,
    d: data.date,
    t: data.time ?? '',
    a: parseFloat(data.lat.toFixed(4)),
    o: parseFloat(data.lng.toFixed(4)),
    z: data.tz,
    c: data.city,
  };
  // Only encode filters if not all enabled (keeps legacy URLs unchanged)
  if (data.filters != null && data.filters !== ALL_FILTERS) {
    payload.f = data.filters;
  }
  const base64url = toBase64url(Buffer.from(JSON.stringify(payload)));
  return signToken(base64url);
}

export function decodeBirthData(token: string): BirthData {
  try {
    const { payload } = verifyToken(token);
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(base64, 'base64').toString('utf8');
    const p: Payload = JSON.parse(json);
    return {
      name: p.n,
      date: p.d,
      time: p.t || null,
      lat: p.a,
      lng: p.o,
      tz: p.z,
      city: p.c,
      filters: p.f, // undefined means all enabled
    };
  } catch (err) {
    // Re-throw with a consistent message so callers can catch uniformly.
    throw new Error('Invalid token');
  }
}
