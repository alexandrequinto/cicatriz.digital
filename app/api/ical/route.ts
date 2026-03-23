import { NextRequest } from 'next/server';
import { decodeBirthData } from '@/lib/birthData';
import { getNatalPositions } from '@/lib/ephemeris';
import { getOuterTransits } from '@/lib/transits';
import { getPersonalTransits } from '@/lib/personalTransits';
import { getLunarPhaseEvents } from '@/lib/lunarPhases';
import { getIngressAndRetrogradeEvents } from '@/lib/ingresses';
import { buildCalendar } from '@/lib/calendarBuilder';

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
  try {
    birth = decodeBirthData(data);
  } catch {
    return new Response('Invalid data token', { status: 400 });
  }

  // Validate decoded fields
  if (!birth.name || !birth.date || typeof birth.lat !== 'number' || typeof birth.lng !== 'number') {
    return new Response('Malformed birth data', { status: 400 });
  }

  const now = new Date();
  const natal = getNatalPositions(birth);

  const [outerTransits, innerTransits, lunar, ingresses] = await Promise.all([
    Promise.resolve(getOuterTransits(natal, now, 12)),
    Promise.resolve(getPersonalTransits(natal, now, 12)),
    Promise.resolve(getLunarPhaseEvents(now, 12)),
    Promise.resolve(getIngressAndRetrogradeEvents(now, 12)),
  ]);

  const allEvents = [...outerTransits, ...innerTransits, ...lunar, ...ingresses];
  allEvents.sort((a, b) => a.exactDate.getTime() - b.exactDate.getTime());

  const calendar = buildCalendar(birth, allEvents);
  const icsContent = calendar.toString();

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
