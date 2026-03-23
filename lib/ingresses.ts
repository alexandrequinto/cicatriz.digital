import { getPlanetLongitude, type PlanetName } from './ephemeris';
import type { TransitEvent } from '@/types/astro';

const INGRESS_PLANETS: PlanetName[] = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
const RETROGRADE_PLANETS: PlanetName[] = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
const SIGN_NAMES = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const ONE_HOUR = 60 * 60 * 1000;
const ONE_DAY = 24 * ONE_HOUR;

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☀', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄',
};

function getSign(lon: number): string {
  return SIGN_NAMES[Math.floor(((lon % 360) + 360) % 360 / 30)];
}

function getSignIndex(lon: number): number {
  return Math.floor(((lon % 360) + 360) % 360 / 30);
}

export function getIngressAndRetrogradeEvents(windowStart: Date, windowMonths: number): TransitEvent[] {
  const events: TransitEvent[] = [];
  const windowEnd = new Date(windowStart);
  windowEnd.setMonth(windowEnd.getMonth() + windowMonths);

  for (const planet of INGRESS_PLANETS) {
    const step = planet === 'Moon' ? 6 * ONE_HOUR : ONE_DAY;
    let cursorMs = windowStart.getTime();
    let prevSign = getSignIndex(getPlanetLongitude(planet, new Date(cursorMs)));
    let prevLon = getPlanetLongitude(planet, new Date(cursorMs));

    while (cursorMs <= windowEnd.getTime()) {
      cursorMs += step;
      const cursor = new Date(cursorMs);
      const lon = getPlanetLongitude(planet, cursor);
      const sign = getSignIndex(lon);

      if (sign !== prevSign) {
        const signName = SIGN_NAMES[sign];
        const sym = PLANET_SYMBOLS[planet] ?? '';
        events.push({
          title: `${planet} ${sym} enters ${signName}`,
          description: `${planet} enters ${signName}`,
          startDate: cursor,
          endDate: new Date(cursorMs + ONE_HOUR),
          exactDate: cursor,
          category: 'ingress',
        });
        prevSign = sign;
      }

      if (RETROGRADE_PLANETS.includes(planet) && step === ONE_DAY) {
        const prevDelta = prevLon - getPlanetLongitude(planet, new Date(cursorMs - 2 * step));
        const currDelta = lon - prevLon;
        const normPrev = prevDelta > 180 ? prevDelta - 360 : prevDelta < -180 ? prevDelta + 360 : prevDelta;
        const normCurr = currDelta > 180 ? currDelta - 360 : currDelta < -180 ? currDelta + 360 : currDelta;

        if (normPrev > 0 && normCurr < 0) {
          events.push({
            title: `${planet} Retrograde ℞`,
            description: `${planet} stations retrograde — begins apparent backward motion`,
            startDate: cursor,
            endDate: new Date(cursorMs + ONE_HOUR),
            exactDate: cursor,
            category: 'retrograde',
          });
        } else if (normPrev < 0 && normCurr > 0) {
          events.push({
            title: `${planet} Direct ↻`,
            description: `${planet} stations direct — resumes forward motion`,
            startDate: cursor,
            endDate: new Date(cursorMs + ONE_HOUR),
            exactDate: cursor,
            category: 'retrograde',
          });
        }
      }

      prevLon = lon;
    }
  }

  return events;
}
