import 'server-only';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) throw new Error('ENCRYPTION_KEY environment variable is not set');
  return createHash('sha256').update(raw).digest();
}

function toBase64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function fromBase64url(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

/**
 * Encrypts a plaintext string with AES-256-GCM.
 * Returns a token prefixed with 'enc.' so callers can identify it.
 * Format: enc.<base64url( iv[12] || authTag[16] || ciphertext )>
 */
export function encryptToken(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag(); // must be called after final()
  return 'enc.' + toBase64url(Buffer.concat([iv, authTag, encrypted]));
}

/**
 * Decrypts an 'enc.' token produced by encryptToken.
 * Throws on any tampering, truncation, or wrong key.
 */
export function decryptToken(token: string): string {
  if (!token.startsWith('enc.')) throw new Error('Not an encrypted token');
  const key = getKey();
  const blob = fromBase64url(token.slice(4));
  if (blob.length < 29) throw new Error('Invalid encrypted token'); // 12 iv + 16 tag + ≥1 data
  const iv = blob.subarray(0, 12);
  const authTag = blob.subarray(12, 28);
  const ciphertext = blob.subarray(28);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(ciphertext) + decipher.final('utf8');
}

export function isEncryptedToken(token: string): boolean {
  return token.startsWith('enc.');
}
