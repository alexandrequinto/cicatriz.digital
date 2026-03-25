import type { NatalPlanet, TransitEvent } from '@/types/astro';
import { getPlanetLongitude, type PlanetName } from './ephemeris';
import { ASPECTS, angularDifference, PLANET_ORB } from './aspects';
import { getInterpretation } from './interpretations';
import { getCalStrings } from './i18n/calendarStrings';

const OUTER_PLANETS: PlanetName[] = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
const NATAL_TARGETS: string[] = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];
const OUTER_ASPECTS = ASPECTS.filter(a => [0, 90, 120, 180].includes(a.angle));
const SCAN_ORB = 10;

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☀', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
};

function getSign(lon: number, signs: string[]): string {
  return signs[Math.floor(((lon % 360) + 360) % 360 / 30)];
}

export function getOuterTransits(natal: NatalPlanet[], windowStart: Date, windowMonths: number, locale?: string): TransitEvent[] {
  const strings = getCalStrings(locale);
  const events: TransitEvent[] = [];
  const windowEnd = new Date(windowStart);
  windowEnd.setMonth(windowEnd.getMonth() + windowMonths);

  for (const transitPlanet of OUTER_PLANETS) {
    for (const natalTarget of NATAL_TARGETS) {
      const natalPlanet = natal.find(n => n.name === natalTarget);
      if (!natalPlanet) continue;
      const exactOrb = (PLANET_ORB[transitPlanet] + PLANET_ORB[natalTarget]) / 2;

      for (const aspect of OUTER_ASPECTS) {
        let inWindow = false;
        let windowStartDate: Date | null = null;
        let minSep = Infinity;
        let exactDate: Date | null = null;
        let ingressDate: Date | null = null;

        const cursor = new Date(windowStart);
        while (cursor <= windowEnd) {
          const lon = getPlanetLongitude(transitPlanet, cursor);
          const sep = Math.abs(angularDifference(lon, natalPlanet.longitude) - aspect.angle);

          if (sep <= SCAN_ORB) {
            if (!inWindow) {
              inWindow = true;
              windowStartDate = new Date(cursor);
              minSep = sep;
              exactDate = new Date(cursor);
            }
            if (sep <= exactOrb && !ingressDate) {
              ingressDate = new Date(cursor);
            }
            if (sep < minSep) {
              minSep = sep;
              exactDate = new Date(cursor);
            }
          } else if (inWindow) {
            if (ingressDate && exactDate && windowStartDate) {
              const transitPlanetName = strings.planets[transitPlanet] ?? transitPlanet;
              const natalTargetName = strings.planets[natalTarget] ?? natalTarget;
              const aspectName = strings.aspects[aspect.name] ?? aspect.name;
              const base = `${transitPlanetName} ${aspect.symbol} natal ${natalTargetName} ${PLANET_SYMBOLS[natalTarget] ?? ''}`.trim();
              const mech = `${transitPlanetName} ${aspectName} your natal ${natalTargetName} in ${getSign(natalPlanet.longitude, strings.signs)}.\nExact: ${exactDate.toDateString()}\nPeak orb: ${minSep.toFixed(1)}°`;
              const interp = getInterpretation(`${transitPlanet}|${aspect.name}|${natalTarget}`, locale);
              const description = `${strings.categoryLabels['outer-transit']}\n\n${interp ? `${mech}\n\n${interp}` : mech}`;
              events.push({
                title: `${base} — begins`,
                description,
                startDate: ingressDate,
                endDate: ingressDate,
                exactDate: ingressDate,
                category: 'outer-transit',
              });
              events.push({
                title: `${base} — exact`,
                description,
                startDate: exactDate,
                endDate: exactDate,
                exactDate,
                category: 'outer-transit',
              });
            }
            inWindow = false;
            windowStartDate = null;
            ingressDate = null;
            minSep = Infinity;
            exactDate = null;
          }

          cursor.setDate(cursor.getDate() + 1);
        }

        if (inWindow && ingressDate && exactDate) {
          const transitPlanetName = strings.planets[transitPlanet] ?? transitPlanet;
          const natalTargetName = strings.planets[natalTarget] ?? natalTarget;
          const aspectName = strings.aspects[aspect.name] ?? aspect.name;
          const base = `${transitPlanetName} ${aspect.symbol} natal ${natalTargetName} ${PLANET_SYMBOLS[natalTarget] ?? ''}`.trim();
          const mech = `${transitPlanetName} ${aspectName} your natal ${natalTargetName} in ${getSign(natalPlanet.longitude, strings.signs)}.\nExact: ${exactDate.toDateString()}\nPeak orb: ${minSep.toFixed(1)}°`;
          const interp = getInterpretation(`${transitPlanet}|${aspect.name}|${natalTarget}`, locale);
          const description = `${strings.categoryLabels['outer-transit']}\n\n${interp ? `${mech}\n\n${interp}` : mech}`;
          events.push({
            title: `${base} — begins`,
            description,
            startDate: ingressDate,
            endDate: ingressDate,
            exactDate: ingressDate,
            category: 'outer-transit',
          });
          if (exactDate.getTime() !== ingressDate.getTime()) {
            events.push({
              title: `${base} — exact`,
              description,
              startDate: exactDate,
              endDate: exactDate,
              exactDate,
              category: 'outer-transit',
            });
          }
        }
      }
    }
  }

  return events;
}
