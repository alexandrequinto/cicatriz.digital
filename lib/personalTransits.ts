import type { NatalPlanet, TransitEvent } from '@/types/astro';
import { getPlanetLongitude, type PlanetName } from './ephemeris';
import { angularDifference, PLANET_ORB } from './aspects';
import { getInterpretation } from './interpretations';
import { getCalStrings } from './i18n/calendarStrings';

const INNER_PLANETS: PlanetName[] = ['Sun', 'Mercury', 'Venus', 'Mars'];
const INNER_ASPECTS = [
  { name: 'conjunct', angle: 0, symbol: '☌' },
  { name: 'opposition', angle: 180, symbol: '☍' },
] as const;

function getSign(lon: number, signs: string[]): string {
  return signs[Math.floor(((lon % 360) + 360) % 360 / 30)];
}

export function getPersonalTransits(natal: NatalPlanet[], windowStart: Date, windowMonths: number, locale?: string): TransitEvent[] {
  const strings = getCalStrings(locale);
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
              const transitPlanetName = strings.planets[transitPlanet] ?? transitPlanet;
              const natalPlanetName = strings.planets[natalPlanet.name] ?? natalPlanet.name;
              const aspectName = strings.aspects[aspect.name] ?? aspect.name;
              const approxSuffix = natalPlanet.name === 'Moon' ? ' (approx)' : '';
              const base = `${transitPlanetName} ${aspect.symbol} natal ${natalPlanetName}${approxSuffix}`;
              const mech = `${transitPlanetName} ${aspectName} your natal ${natalPlanetName} in ${getSign(natalPlanet.longitude, strings.signs)}.`;
              const interp = getInterpretation(`${transitPlanet}|${aspect.name}|${natalPlanet.name}`, locale);
              const description = `${strings.categoryLabels['inner-transit']}\n\n${interp ? `${mech}\n\n${interp}` : mech}`;
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
          const transitPlanetName = strings.planets[transitPlanet] ?? transitPlanet;
          const natalPlanetName = strings.planets[natalPlanet.name] ?? natalPlanet.name;
          const aspectName = strings.aspects[aspect.name] ?? aspect.name;
          const approxSuffix = natalPlanet.name === 'Moon' ? ' (approx)' : '';
          const base = `${transitPlanetName} ${aspect.symbol} natal ${natalPlanetName}${approxSuffix}`;
          const mech = `${transitPlanetName} ${aspectName} your natal ${natalPlanetName} in ${getSign(natalPlanet.longitude, strings.signs)}.`;
          const interp = getInterpretation(`${transitPlanet}|${aspect.name}|${natalPlanet.name}`, locale);
          const description = `${strings.categoryLabels['inner-transit']}\n\n${interp ? `${mech}\n\n${interp}` : mech}`;
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
