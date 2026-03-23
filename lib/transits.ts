import type { NatalPlanet, TransitEvent } from '@/types/astro';
import { getPlanetLongitude, type PlanetName } from './ephemeris';
import { ASPECTS, angularDifference, PLANET_ORB } from './aspects';
import { getInterpretation } from './interpretations';

const OUTER_PLANETS: PlanetName[] = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
const NATAL_TARGETS: string[] = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];
const OUTER_ASPECTS = ASPECTS.filter(a => [0, 90, 120, 180].includes(a.angle));
const SCAN_ORB = 10;

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☀', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
};

const SIGN_NAMES = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

function getSign(lon: number): string {
  return SIGN_NAMES[Math.floor(((lon % 360) + 360) % 360 / 30)];
}

export function getOuterTransits(natal: NatalPlanet[], windowStart: Date, windowMonths: number): TransitEvent[] {
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
              const egressDate = new Date(cursor);
              const mech = `${transitPlanet} ${aspect.name} your natal ${natalTarget} in ${getSign(natalPlanet.longitude)}.\nExact: ${exactDate.toDateString()}\nPeak orb: ${minSep.toFixed(1)}°`;
              const interp = getInterpretation(`${transitPlanet}|${aspect.name}|${natalTarget}`);
              events.push({
                title: `${transitPlanet} ${aspect.symbol} natal ${natalTarget} ${PLANET_SYMBOLS[natalTarget] ?? ''}`.trim(),
                description: interp ? `${mech}\n\n${interp}` : mech,
                startDate: ingressDate,
                endDate: egressDate,
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
          const mech = `${transitPlanet} ${aspect.name} your natal ${natalTarget} in ${getSign(natalPlanet.longitude)}.\nExact: ${exactDate.toDateString()}\nPeak orb: ${minSep.toFixed(1)}°`;
          const interp = getInterpretation(`${transitPlanet}|${aspect.name}|${natalTarget}`);
          events.push({
            title: `${transitPlanet} ${aspect.symbol} natal ${natalTarget} ${PLANET_SYMBOLS[natalTarget] ?? ''}`.trim(),
            description: interp ? `${mech}\n\n${interp}` : mech,
            startDate: ingressDate,
            endDate: windowEnd,
            exactDate,
            category: 'outer-transit',
          });
        }
      }
    }
  }

  return events;
}
