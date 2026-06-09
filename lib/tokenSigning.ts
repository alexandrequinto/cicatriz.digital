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
    throw new Error('HMAC_SECRET is not set');
  }
  const sig = createHmac('sha256', secret).update(payload).digest();
  return `${payload}.${toBase64url(sig)}`;
}

/**
 * Verifies a token (signed or legacy unsigned).
 * - Signed (`payload.sig`): verifies HMAC; throws if invalid.
 * - Legacy (no dot): accepted silently, returns `legacy: true`.
 * - No HMAC_SECRET: throws.
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
    throw new Error('HMAC_SECRET is not set');
  }

  const expectedBuf = createHmac('sha256', secret).update(payload).digest();
  const receivedBuf = Buffer.from(receivedSig, 'base64url');
  const valid = receivedBuf.length === expectedBuf.length && timingSafeEqual(receivedBuf, expectedBuf);

  if (!valid) throw new Error('Invalid token signature');
  return { payload, legacy: false };
}
