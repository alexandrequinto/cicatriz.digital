import { NextRequest } from 'next/server';
import { decodeBirthData } from '@/lib/birthData';
import { verifyToken } from '@/lib/tokenSigning';
import { getNatalPositions } from '@/lib/ephemeris';
import { getOuterTransits } from '@/lib/transits';
import { getPersonalTransits } from '@/lib/personalTransits';
import { getLunarPhaseEvents } from '@/lib/lunarPhases';
import { getIngressAndRetrogradeEvents } from '@/lib/ingresses';
import { buildCalendar } from '@/lib/calendarBuilder';
import { FILTER_BITS } from '@/lib/birthData';

// Use Node.js runtime (NOT edge) — astronomy-engine needs full Node.js
export const runtime = 'nodejs';

// Rate limiting: simple in-memory (resets on cold start, good enough for serverless)
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 60; // requests per hour per IP
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in ms

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);
  if (!record || now > record.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }
  record.count++;
  return record.count > RATE_LIMIT;
}

export async function GET(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (isRateLimited(ip)) {
    return new Response('Too Many Requests', { status: 429 });
  }

  const data = request.nextUrl.searchParams.get('data');
  if (!data || data.length > 2000) {
    return new Response('Missing or invalid data parameter', { status: 400 });
  }

  let birth;
  let legacy = false;
  try {
    const { payload, legacy: isLegacy } = verifyToken(data);
    legacy = isLegacy;
    birth = decodeBirthData(payload);
  } catch {
    return new Response(
      JSON.stringify({ error: 'invalid_token', message: 'Token is invalid or has been tampered with.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (legacy) {
    const requestId = Math.random().toString(36).slice(2, 9);
    console.warn(JSON.stringify({ requestId, warning: 'unsigned_legacy_token' }));
  }

  // Validate decoded fields
  if (!birth.name || !birth.date || typeof birth.lat !== 'number' || typeof birth.lng !== 'number') {
    return new Response('Malformed birth data', { status: 400 });
  }

  // Validate date is a real ISO date
  const birthDate = new Date(birth.date + 'T12:00:00Z');
  if (isNaN(birthDate.getTime())) {
    return new Response('Invalid birth date', { status: 400 });
  }
  // Validate lat/lng ranges
  if (birth.lat < -90 || birth.lat > 90 || birth.lng < -180 || birth.lng > 180) {
    return new Response('Invalid coordinates', { status: 400 });
  }
  // Validate time format if present
  if (birth.time && !/^\d{2}:\d{2}$/.test(birth.time)) {
    return new Response('Invalid birth time format', { status: 400 });
  }
  // Validate filters bitmask if present
  if (birth.filters != null && (!Number.isInteger(birth.filters) || birth.filters < 0 || birth.filters > 31)) {
    return new Response('Invalid filters value', { status: 400 });
  }

  // Validate timezone against IANA database
  if (!birth.tz || birth.tz.length > 100) {
    return new Response('Invalid timezone', { status: 400 });
  }
  try {
    Intl.DateTimeFormat(undefined, { timeZone: birth.tz });
  } catch {
    return new Response('Unknown timezone', { status: 400 });
  }

  const requestId = Math.random().toString(36).slice(2, 9);
  const t0 = Date.now();

  let icsContent: string;

  try {
    const now = new Date();
    const natal = getNatalPositions(birth);

    const t1 = Date.now();

    const TIMEOUT_MS = 20_000;
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS)
    );

    const [outerTransits, innerTransits, lunar, ingresses] = await Promise.race([
      Promise.all([
        Promise.resolve(getOuterTransits(natal, now, 12)),
        Promise.resolve(getPersonalTransits(natal, now, 12)),
        Promise.resolve(getLunarPhaseEvents(now, 12)),
        Promise.resolve(getIngressAndRetrogradeEvents(now, 12)),
      ]),
      timeoutPromise,
    ]) as [ReturnType<typeof getOuterTransits>, ReturnType<typeof getPersonalTransits>, ReturnType<typeof getLunarPhaseEvents>, ReturnType<typeof getIngressAndRetrogradeEvents>];

    const t2 = Date.now();

    const allEvents = [...outerTransits, ...innerTransits, ...lunar, ...ingresses];

    // Apply category filter if specified (absent or 31 = all enabled, backward-compatible)
    const activeFilters = birth.filters;
    const filteredEvents = activeFilters != null
      ? allEvents.filter(e => (activeFilters & FILTER_BITS[e.category]) !== 0)
      : allEvents;

    filteredEvents.sort((a, b) => a.exactDate.getTime() - b.exactDate.getTime());

    const calendar = buildCalendar(birth, filteredEvents, data);
    icsContent = calendar.toString();

    console.log(JSON.stringify({
      requestId,
      event: 'ical_generated',
      computeMs: t2 - t1,
      totalMs: Date.now() - t0,
      filters: activeFilters ?? 'all',
      eventCounts: {
        outer: outerTransits.length,
        inner: innerTransits.length,
        lunar: lunar.length,
        ingresses: ingresses.length,
        total: allEvents.length,
        filtered: filteredEvents.length,
      },
    }));
  } catch (err) {
    const isTimeout = err instanceof Error && err.message === 'timeout';
    if (isTimeout) {
      return new Response('Calendar generation timed out', {
        status: 503,
        headers: { 'Retry-After': '30' },
      });
    }
    console.error(JSON.stringify({
      requestId,
      event: 'ical_error',
      error: err instanceof Error ? err.message : String(err),
      totalMs: Date.now() - t0,
    }));
    return new Response('Failed to generate calendar', { status: 500 });
  }

  const safeName = birth.name.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 50);

  return new Response(icsContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${safeName}-astro.ics"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
    },
  });
}
