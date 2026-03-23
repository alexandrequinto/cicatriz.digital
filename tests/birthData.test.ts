import { describe, it, expect } from 'vitest';
import { encodeBirthData, decodeBirthData } from '@/lib/birthData';

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
    const result = decodeBirthData(token);
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
