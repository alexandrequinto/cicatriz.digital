import { getPlanetLongitude, type PlanetName } from './ephemeris';
import type { TransitEvent } from '@/types/astro';
import { getInterpretation } from './interpretations';

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
    // After a sign ingress, the next retrograde check's prevDelta would span the sign
    // boundary producing a corrupt delta. Skip detection for one step after any ingress.
    let skipNextRetrogradeCheck = false;
    // Pending retrograde: saved when station Rx is detected; closed (pushed) when station direct arrives.
    let pendingRetrograde: { startMs: number; title: string; description: string } | null = null;

    while (cursorMs <= windowEnd.getTime()) {
      cursorMs += step;
      const cursor = new Date(cursorMs);
      const lon = getPlanetLongitude(planet, cursor);
      const sign = getSignIndex(lon);

      const hadIngress = sign !== prevSign;
      if (hadIngress) {
        const signName = SIGN_NAMES[sign];
        const sym = PLANET_SYMBOLS[planet] ?? '';
        const ingressMech = `${planet} enters ${signName}`;
        const ingressInterp = getInterpretation(`${planet}|ingress|${signName}`);
        events.push({
          title: `${planet} ${sym} enters ${signName}`,
          description: ingressInterp ? `${ingressMech}\n\n${ingressInterp}` : ingressMech,
          startDate: cursor,
          endDate: new Date(cursorMs + ONE_HOUR),
          exactDate: cursor,
          category: 'ingress',
        });
        prevSign = sign;
        prevLon = lon; // reset baseline — prevents corrupt delta in current step
        skipNextRetrogradeCheck = true; // next step's prevDelta would still span boundary
      }

      if (RETROGRADE_PLANETS.includes(planet) && step === ONE_DAY && !hadIngress && !skipNextRetrogradeCheck) {
        const prevDelta = prevLon - getPlanetLongitude(planet, new Date(cursorMs - 2 * step));
        const currDelta = lon - prevLon;
        const normPrev = prevDelta > 180 ? prevDelta - 360 : prevDelta < -180 ? prevDelta + 360 : prevDelta;
        const normCurr = currDelta > 180 ? currDelta - 360 : currDelta < -180 ? currDelta + 360 : currDelta;

        if (normPrev > 0 && normCurr < 0) {
          // Station retrograde — save start date; event is pushed when direct station is found
          const rxMech = `${planet} stations retrograde — begins apparent backward motion`;
          const rxInterp = getInterpretation(`${planet}|retrograde`);
          pendingRetrograde = {
            startMs: cursorMs,
            title: `${planet} Retrograde ℞`,
            description: rxInterp ? `${rxMech}\n\n${rxInterp}` : rxMech,
          };
        } else if (normPrev < 0 && normCurr > 0) {
          // Station direct — close the pending retrograde span
          if (pendingRetrograde) {
            events.push({
              title: pendingRetrograde.title,
              description: pendingRetrograde.description,
              startDate: new Date(pendingRetrograde.startMs),
              endDate: cursor,
              exactDate: new Date(pendingRetrograde.startMs),
              category: 'retrograde',
            });
            pendingRetrograde = null;
          }
          const dMech = `${planet} stations direct — resumes forward motion`;
          const dInterp = getInterpretation(`${planet}|direct`);
          events.push({
            title: `${planet} Direct ↻`,
            description: dInterp ? `${dMech}\n\n${dInterp}` : dMech,
            startDate: cursor,
            endDate: new Date(cursorMs + ONE_HOUR),
            exactDate: cursor,
            category: 'retrograde',
          });
        }
      } else if (!hadIngress) {
        skipNextRetrogradeCheck = false;
      }

      prevLon = lon;
    }

    // Window ends during a retrograde — push the open span up to windowEnd
    if (pendingRetrograde) {
      events.push({
        title: pendingRetrograde.title,
        description: pendingRetrograde.description,
        startDate: new Date(pendingRetrograde.startMs),
        endDate: windowEnd,
        exactDate: new Date(pendingRetrograde.startMs),
        category: 'retrograde',
      });
    }
  }

  return events;
}
