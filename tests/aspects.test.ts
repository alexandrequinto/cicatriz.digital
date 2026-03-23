import { describe, it, expect } from 'vitest';
import { angularDifference, detectAspect } from '@/lib/aspects';

describe('angularDifference', () => {
  it('returns 0 for identical longitudes', () => {
    expect(angularDifference(45, 45)).toBe(0);
  });

  it('returns the shortest arc across the 0/360 boundary', () => {
    // 350° and 10° are 20° apart (not 340°)
    expect(angularDifference(350, 10)).toBeCloseTo(20, 5);
  });

  it('returns 180 for opposition', () => {
    expect(angularDifference(0, 180)).toBe(180);
    expect(angularDifference(90, 270)).toBe(180);
  });

  it('never exceeds 180', () => {
    for (let a = 0; a < 360; a += 13) {
      for (let b = 0; b < 360; b += 17) {
        expect(angularDifference(a, b)).toBeLessThanOrEqual(180);
      }
    }
  });
});

describe('detectAspect', () => {
  it('detects conjunction at 0°', () => {
    const result = detectAspect(100, 100, 'Saturn', 'Sun');
    expect(result).not.toBeNull();
    expect(result!.name).toBe('conjunct');
  });

  it('detects opposition at 180°', () => {
    const result = detectAspect(0, 180, 'Saturn', 'Sun');
    expect(result!.name).toBe('opposition');
  });

  it('detects square at 90°', () => {
    const result = detectAspect(0, 90, 'Saturn', 'Sun');
    expect(result!.name).toBe('square');
  });

  it('returns null when outside orb', () => {
    // 45° is not within orb of any aspect for Saturn/Sun (orb = 7.5°)
    // nearest aspects are sextile (60°, 15° away) and conjunct (0°, 45° away)
    const result = detectAspect(0, 45, 'Saturn', 'Sun');
    expect(result).toBeNull();
  });

  it('detects conjunction across the 0/360 boundary', () => {
    const result = detectAspect(358, 2, 'Saturn', 'Sun');
    expect(result).not.toBeNull();
    expect(result!.name).toBe('conjunct');
  });
});
