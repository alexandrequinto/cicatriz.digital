import * as Astronomy from 'astronomy-engine';
import type { BirthData, NatalPlanet } from '@/types/astro';

export type PlanetName = 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars' | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune' | 'Pluto';

export const ALL_PLANETS: PlanetName[] = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

export function getPlanetLongitude(planet: PlanetName, date: Date): number {
  if (planet === 'Moon') {
    const sph = Astronomy.EclipticGeoMoon(date);
    return ((sph.lon % 360) + 360) % 360;
  }
  if (planet === 'Sun') {
    const pos = Astronomy.SunPosition(date);
    return ((pos.elon % 360) + 360) % 360;
  }
  const body = Astronomy.Body[planet as keyof typeof Astronomy.Body];
  const geoVec = Astronomy.GeoVector(body, date, true);
  const ecl = Astronomy.Ecliptic(geoVec);
  return ((ecl.elon % 360) + 360) % 360;
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
