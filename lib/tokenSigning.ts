import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';

function toBase64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Signs a base64url payload with HMAC-SHA256.
 * Returns `<payload>.<base64url_signature>`.
 * Requires HMAC_SECRET env var — throws in its absence (server-only, always set in prod).
 */
export function signToken(payload: string): string {
  const secret = process.env.HMAC_SECRET;
  if (!secret) {
    console.warn('[tokenSigning] HMAC_SECRET is not set — token will not be signed.');
    return payload;
  }
  const sig = createHmac('sha256', secret).update(payload).digest();
  return `${payload}.${toBase64url(sig)}`;
}

/**
 * Verifies a token (signed or legacy unsigned).
 * - Signed (`payload.sig`): verifies HMAC; throws if invalid.
 * - Legacy (no dot): accepted silently, returns `legacy: true`.
 * - No HMAC_SECRET: skips verification with a warning.
 */
export function verifyToken(token: string): { payload: string; legacy: boolean } {
  const dotIndex = token.lastIndexOf('.');
  if (dotIndex === -1) {
    return { payload: token, legacy: true };
  }

  const payload = token.slice(0, dotIndex);
  const receivedSig = token.slice(dotIndex + 1);

  const secret = process.env.HMAC_SECRET;
  if (!secret) {
    console.warn('[tokenSigning] HMAC_SECRET is not set — skipping token signature verification.');
    return { payload, legacy: false };
  }

  const expectedSigBuf = createHmac('sha256', secret).update(payload).digest();
  const expectedSig = toBase64url(expectedSigBuf);

  // Pad both buffers to the same length so timingSafeEqual always runs in constant time.
  const receivedBuf = Buffer.from(receivedSig);
  const expectedBuf = Buffer.from(expectedSig);
  const len = Math.max(receivedBuf.length, expectedBuf.length);
  const a = Buffer.concat([receivedBuf, Buffer.alloc(len - receivedBuf.length)]);
  const b = Buffer.concat([expectedBuf, Buffer.alloc(len - expectedBuf.length)]);
  const valid = timingSafeEqual(a, b) && receivedBuf.length === expectedBuf.length;

  if (!valid) throw new Error('Invalid token signature');
  return { payload, legacy: false };
}
