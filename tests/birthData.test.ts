import { describe, it, expect } from 'vitest';
import { encodeBirthData, decodeBirthData } from '@/lib/birthData';
import { signToken, verifyToken } from '@/lib/tokenSigning';

const sample = {
  name: 'Sofia',
  date: '1990-05-15',
  time: '14:30',
  lat: -23.5505,
  lng: -46.6333,
  tz: 'America/Sao_Paulo',
  city: 'São Paulo, Brazil',
};

describe('birthData', () => {
  it('round-trips birth data through encode/decode', () => {
    const token = encodeBirthData(sample);
    const result = decodeBirthData(token); // unsigned payload goes directly to decode
    expect(result.name).toBe(sample.name);
    expect(result.date).toBe(sample.date);
    expect(result.time).toBe(sample.time);
    expect(result.lat).toBeCloseTo(sample.lat, 3);
    expect(result.lng).toBeCloseTo(sample.lng, 3);
    expect(result.tz).toBe(sample.tz);
  });

  it('handles null birth time', () => {
    const token = encodeBirthData({ ...sample, time: null });
    const result = decodeBirthData(token);
    expect(result.time).toBeNull();
  });

  it('throws on invalid token', () => {
    expect(() => decodeBirthData('not-valid-base64!!!')).toThrow();
  });

  it('produces a URL-safe token (no +, /, or = chars)', () => {
    const token = encodeBirthData(sample);
    expect(token).not.toMatch(/[+/=]/);
  });
});

describe('verifyToken', () => {
  it('treats a token with no dot as legacy', () => {
    const result = verifyToken('somebase64urlpayload');
    expect(result.legacy).toBe(true);
    expect(result.payload).toBe('somebase64urlpayload');
  });

  it('accepts a signed token when HMAC_SECRET is set', () => {
    const originalSecret = process.env.HMAC_SECRET;
    process.env.HMAC_SECRET = 'test-secret';
    try {
      const payload = 'somebase64urlpayload';
      const signed = signToken(payload);
      expect(signed).toContain('.');
      const result = verifyToken(signed);
      expect(result.legacy).toBe(false);
      expect(result.payload).toBe(payload);
    } finally {
      if (originalSecret === undefined) {
        delete process.env.HMAC_SECRET;
      } else {
        process.env.HMAC_SECRET = originalSecret;
      }
    }
  });

  it('throws on a tampered signed token', () => {
    const originalSecret = process.env.HMAC_SECRET;
    process.env.HMAC_SECRET = 'test-secret';
    try {
      const payload = 'somebase64urlpayload';
      const signed = signToken(payload);
      const tampered = signed.slice(0, -3) + 'xxx';
      expect(() => verifyToken(tampered)).toThrow('Invalid token signature');
    } finally {
      if (originalSecret === undefined) {
        delete process.env.HMAC_SECRET;
      } else {
        process.env.HMAC_SECRET = originalSecret;
      }
    }
  });

  it('skips verification and returns legacy:false when HMAC_SECRET is absent', () => {
    const originalSecret = process.env.HMAC_SECRET;
    delete process.env.HMAC_SECRET;
    try {
      // A dot-containing token with no valid secret set: skip verification
      const result = verifyToken('payload.fakesig');
      expect(result.legacy).toBe(false);
      expect(result.payload).toBe('payload');
    } finally {
      if (originalSecret !== undefined) {
        process.env.HMAC_SECRET = originalSecret;
      }
    }
  });
});

describe('signToken', () => {
  it('returns unsigned payload when HMAC_SECRET is absent', () => {
    const originalSecret = process.env.HMAC_SECRET;
    delete process.env.HMAC_SECRET;
    try {
      const result = signToken('mypayload');
      expect(result).toBe('mypayload');
    } finally {
      if (originalSecret !== undefined) {
        process.env.HMAC_SECRET = originalSecret;
      }
    }
  });

  it('returns payload.signature when HMAC_SECRET is set', () => {
    const originalSecret = process.env.HMAC_SECRET;
    process.env.HMAC_SECRET = 'test-secret';
    try {
      const result = signToken('mypayload');
      expect(result).toMatch(/^mypayload\.[A-Za-z0-9_-]+$/);
    } finally {
      if (originalSecret === undefined) {
        delete process.env.HMAC_SECRET;
      } else {
        process.env.HMAC_SECRET = originalSecret;
      }
    }
  });

  it('signed token has no +, /, or = in the signature', () => {
    const originalSecret = process.env.HMAC_SECRET;
    process.env.HMAC_SECRET = 'test-secret';
    try {
      const result = signToken('mypayload');
      expect(result).not.toMatch(/[+/=]/);
    } finally {
      if (originalSecret === undefined) {
        delete process.env.HMAC_SECRET;
      } else {
        process.env.HMAC_SECRET = originalSecret;
      }
    }
  });
});
