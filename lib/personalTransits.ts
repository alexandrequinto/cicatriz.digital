import type { NatalPlanet, TransitEvent } from '@/types/astro';
import { getPlanetLongitude, type PlanetName } from './ephemeris';
import { angularDifference, PLANET_ORB } from './aspects';
import { getInterpretation } from './interpretations';

const INNER_PLANETS: PlanetName[] = ['Sun', 'Mercury', 'Venus', 'Mars'];
const INNER_ASPECTS = [
  { name: 'conjunct', angle: 0, symbol: '☌' },
  { name: 'opposition', angle: 180, symbol: '☍' },
] as const;

const SIGN_NAMES = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

function getSign(lon: number): string {
  return SIGN_NAMES[Math.floor(((lon % 360) + 360) % 360 / 30)];
}

export function getPersonalTransits(natal: NatalPlanet[], windowStart: Date, windowMonths: number): TransitEvent[] {
  const events: TransitEvent[] = [];
  const windowEnd = new Date(windowStart);
  windowEnd.setMonth(windowEnd.getMonth() + windowMonths);

  const SIX_HOURS = 6 * 60 * 60 * 1000;

  for (const transitPlanet of INNER_PLANETS) {
    for (const natalPlanet of natal) {
      const exactOrb = (PLANET_ORB[transitPlanet] + PLANET_ORB[natalPlanet.name]) / 2;

      for (const aspect of INNER_ASPECTS) {
        let inWindow = false;
        let ingressDate: Date | null = null;
        let minSep = Infinity;
        let exactDate: Date | null = null;

        let cursorMs = windowStart.getTime();
        while (cursorMs <= windowEnd.getTime()) {
          const cursor = new Date(cursorMs);
          const lon = getPlanetLongitude(transitPlanet, cursor);
          const sep = Math.abs(angularDifference(lon, natalPlanet.longitude) - aspect.angle);

          if (sep <= exactOrb) {
            if (!inWindow) {
              inWindow = true;
              ingressDate = new Date(cursor);
              minSep = sep;
              exactDate = new Date(cursor);
            }
            if (sep < minSep) {
              minSep = sep;
              exactDate = new Date(cursor);
            }
          } else if (inWindow) {
            if (ingressDate && exactDate) {
              const approxSuffix = natalPlanet.name === 'Moon' ? ' (approx)' : '';
              const base = `${transitPlanet} ${aspect.symbol} natal ${natalPlanet.name}${approxSuffix}`;
              const mech = `${transitPlanet} ${aspect.name} your natal ${natalPlanet.name} in ${getSign(natalPlanet.longitude)}.`;
              const interp = getInterpretation(`${transitPlanet}|${aspect.name}|${natalPlanet.name}`);
              const description = interp ? `${mech}\n\n${interp}` : mech;
              events.push({
                title: `${base} — begins`,
                description,
                startDate: ingressDate,
                endDate: ingressDate,
                exactDate: ingressDate,
                category: 'inner-transit',
              });
              if (exactDate.getTime() !== ingressDate.getTime()) {
                events.push({
                  title: `${base} — exact`,
                  description,
                  startDate: exactDate,
                  endDate: exactDate,
                  exactDate,
                  category: 'inner-transit',
                });
              }
            }
            inWindow = false;
            ingressDate = null;
            minSep = Infinity;
            exactDate = null;
          }

          cursorMs += SIX_HOURS;
        }

        // After the while loop, flush any open window
        if (inWindow && ingressDate && exactDate) {
          const approxSuffix = natalPlanet.name === 'Moon' ? ' (approx)' : '';
          const base = `${transitPlanet} ${aspect.symbol} natal ${natalPlanet.name}${approxSuffix}`;
          const mech = `${transitPlanet} ${aspect.name} your natal ${natalPlanet.name} in ${getSign(natalPlanet.longitude)}.`;
          const interp = getInterpretation(`${transitPlanet}|${aspect.name}|${natalPlanet.name}`);
          const description = interp ? `${mech}\n\n${interp}` : mech;
          events.push({
            title: `${base} — begins`,
            description,
            startDate: ingressDate,
            endDate: ingressDate,
            exactDate: ingressDate,
            category: 'inner-transit',
          });
          if (exactDate.getTime() !== ingressDate.getTime()) {
            events.push({
              title: `${base} — exact`,
              description,
              startDate: exactDate,
              endDate: exactDate,
              exactDate,
              category: 'inner-transit',
            });
          }
        }
      }
    }
  }

  return events;
}
