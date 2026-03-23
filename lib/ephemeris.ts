import * as Astronomy from 'astronomy-engine';
import type { BirthData, NatalPlanet } from '@/types/astro';

export type PlanetName = 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars' | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune' | 'Pluto';

export const ALL_PLANETS: PlanetName[] = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

// Module-level cache — lives for the duration of one request (Node.js serverless)
const lonCache = new Map<string, number>();

export function getPlanetLongitude(planet: PlanetName, date: Date): number {
  // Round to nearest hour for cache key — sufficient precision for transit scanning
  const hourKey = Math.floor(date.getTime() / 3_600_000);
  const cacheKey = `${planet}:${hourKey}`;

  if (lonCache.has(cacheKey)) return lonCache.get(cacheKey)!;

  let lon: number;
  if (planet === 'Moon') {
    const sph = Astronomy.EclipticGeoMoon(date);
    lon = ((sph.lon % 360) + 360) % 360;
  } else if (planet === 'Sun') {
    const pos = Astronomy.SunPosition(date);
    lon = ((pos.elon % 360) + 360) % 360;
  } else {
    const body = Astronomy.Body[planet as keyof typeof Astronomy.Body];
    const geoVec = Astronomy.GeoVector(body, date, true);
    const ecl = Astronomy.Ecliptic(geoVec);
    lon = ((ecl.elon % 360) + 360) % 360;
  }

  lonCache.set(cacheKey, lon);
  return lon;
}

export function clearLonCache(): void {
  lonCache.clear();
}

export function getNatalPositions(birth: BirthData): NatalPlanet[] {
  const birthDateTime = birth.time
    ? new Date(`${birth.date}T${birth.time}:00`)
    : new Date(`${birth.date}T12:00:00`);
  return ALL_PLANETS.map(p => ({
    name: p,
    longitude: getPlanetLongitude(p, birthDateTime),
  }));
}
