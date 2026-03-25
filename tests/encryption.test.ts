import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { encryptToken, decryptToken, isEncryptedToken } from '@/lib/encryption';

const TEST_KEY = 'test-encryption-key-for-vitest';
const PLAINTEXT = 'eyJuIjoiU29maWEiLCJkIjoiMTk5MC0wNS0xNSJ9'; // sample base64url payload

function withKey(fn: () => void) {
  const original = process.env.ENCRYPTION_KEY;
  process.env.ENCRYPTION_KEY = TEST_KEY;
  try { fn(); } finally {
    if (original === undefined) delete process.env.ENCRYPTION_KEY;
    else process.env.ENCRYPTION_KEY = original;
  }
}

function withNoKey(fn: () => void) {
  const original = process.env.ENCRYPTION_KEY;
  delete process.env.ENCRYPTION_KEY;
  try { fn(); } finally {
    if (original !== undefined) process.env.ENCRYPTION_KEY = original;
  }
}

describe('encryptToken / decryptToken', () => {
  it('round-trips plaintext', () => {
    withKey(() => {
      expect(decryptToken(encryptToken(PLAINTEXT))).toBe(PLAINTEXT);
    });
  });

  it('produces different tokens on each call (random IV)', () => {
    withKey(() => {
      const a = encryptToken(PLAINTEXT);
      const b = encryptToken(PLAINTEXT);
      expect(a).not.toBe(b);
    });
  });

  it('token starts with enc.', () => {
    withKey(() => {
      expect(encryptToken(PLAINTEXT)).toMatch(/^enc\./);
    });
  });

  it('token contains no +, /, or = characters', () => {
    withKey(() => {
      expect(encryptToken(PLAINTEXT)).not.toMatch(/[+/=]/);
    });
  });

  it('throws on tampered ciphertext', () => {
    withKey(() => {
      const token = encryptToken(PLAINTEXT);
      const tampered = token.slice(0, -4) + 'xxxx';
      expect(() => decryptToken(tampered)).toThrow();
    });
  });

  it('throws on truncated token', () => {
    withKey(() => {
      expect(() => decryptToken('enc.dG9vc2hvcnQ')).toThrow('Invalid encrypted token');
    });
  });

  it('throws when ENCRYPTION_KEY is absent (encrypt)', () => {
    withNoKey(() => {
      expect(() => encryptToken(PLAINTEXT)).toThrow('ENCRYPTION_KEY');
    });
  });

  it('throws when ENCRYPTION_KEY is absent (decrypt)', () => {
    withKey(() => {
      const token = encryptToken(PLAINTEXT);
      withNoKey(() => {
        expect(() => decryptToken(token)).toThrow('ENCRYPTION_KEY');
      });
    });
  });

  it('throws when decrypting with wrong key', () => {
    withKey(() => {
      const token = encryptToken(PLAINTEXT);
      process.env.ENCRYPTION_KEY = 'completely-different-key';
      expect(() => decryptToken(token)).toThrow();
      process.env.ENCRYPTION_KEY = TEST_KEY;
    });
  });
});

describe('isEncryptedToken', () => {
  it('returns true for enc. tokens', () => {
    expect(isEncryptedToken('enc.someciphertext')).toBe(true);
  });

  it('returns false for legacy base64url tokens', () => {
    expect(isEncryptedToken('eyJuIjoiU29maWEifQ')).toBe(false);
  });

  it('returns false for HMAC-signed tokens', () => {
    expect(isEncryptedToken('eyJuIjoiU29maWEifQ.signature')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isEncryptedToken('')).toBe(false);
  });
});
