import { describe, it, expect } from 'vitest';
import { getPlanetLongitude, getNatalPositions, clearLonCache } from '@/lib/ephemeris';

const testDate = new Date('2000-01-01T12:00:00Z'); // J2000.0 — well-known epoch

describe('getPlanetLongitude', () => {
  it('returns a value in [0, 360) for the Sun', () => {
    const lon = getPlanetLongitude('Sun', testDate);
    expect(lon).toBeGreaterThanOrEqual(0);
    expect(lon).toBeLessThan(360);
  });

  it('returns a value in [0, 360) for the Moon', () => {
    const lon = getPlanetLongitude('Moon', testDate);
    expect(lon).toBeGreaterThanOrEqual(0);
    expect(lon).toBeLessThan(360);
  });

  it('returns consistent results for the same inputs (memoization)', () => {
    clearLonCache();
    const lon1 = getPlanetLongitude('Saturn', testDate);
    const lon2 = getPlanetLongitude('Saturn', testDate);
    expect(lon1).toBe(lon2);
  });

  it('returns different values for different dates', () => {
    const lon1 = getPlanetLongitude('Moon', new Date('2000-01-01T00:00:00Z'));
    const lon2 = getPlanetLongitude('Moon', new Date('2000-01-15T00:00:00Z'));
    expect(lon1).not.toBe(lon2);
  });
});

describe('getNatalPositions', () => {
  it('returns 10 planets', () => {
    const birth = {
      name: 'Test', date: '1990-05-15', time: '12:00',
      lat: 40.71, lng: -74.01, tz: 'America/New_York', city: 'New York',
    };
    const positions = getNatalPositions(birth);
    expect(positions).toHaveLength(10);
  });

  it('uses noon when time is null', () => {
    const withTime = getNatalPositions({
      name: 'T', date: '1990-05-15', time: '12:00',
      lat: 40.71, lng: -74.01, tz: 'America/New_York', city: 'New York',
    });
    const withoutTime = getNatalPositions({
      name: 'T', date: '1990-05-15', time: null,
      lat: 40.71, lng: -74.01, tz: 'America/New_York', city: 'New York',
    });
    // Sun moves ~1°/day so at noon they should be very close
    const sunWith = withTime.find(p => p.name === 'Sun')!;
    const sunWithout = withoutTime.find(p => p.name === 'Sun')!;
    expect(Math.abs(sunWith.longitude - sunWithout.longitude)).toBeLessThan(1);
  });
});
