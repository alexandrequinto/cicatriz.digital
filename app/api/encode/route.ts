import { NextRequest } from 'next/server';
import { encodeBirthData } from '@/lib/birthData';
import { encryptToken } from '@/lib/encryption';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return new Response('Invalid request body', { status: 400 });
  }

  const { name, date, time, lat, lng, tz, city, filters } = body as Record<string, unknown>;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return new Response('Missing name', { status: 400 });
  }
  if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new Response('Invalid date', { status: 400 });
  }
  if (time !== null && time !== undefined && (typeof time !== 'string' || !/^\d{2}:\d{2}$/.test(time))) {
    return new Response('Invalid time format', { status: 400 });
  }
  if (typeof lat !== 'number' || lat < -90 || lat > 90) {
    return new Response('Invalid lat', { status: 400 });
  }
  if (typeof lng !== 'number' || lng < -180 || lng > 180) {
    return new Response('Invalid lng', { status: 400 });
  }
  if (!tz || typeof tz !== 'string' || tz.length > 100) {
    return new Response('Invalid timezone', { status: 400 });
  }
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
  } catch {
    return new Response('Unknown timezone', { status: 400 });
  }
  if (!city || typeof city !== 'string') {
    return new Response('Missing city', { status: 400 });
  }
  if (filters !== undefined && (!Number.isInteger(filters) || (filters as number) < 0 || (filters as number) > 63)) {
    return new Response('Invalid filters', { status: 400 });
  }

  try {
    const payload = encodeBirthData({
      name: (name as string).trim(),
      date: date as string,
      time: (time as string | null | undefined) ?? null,
      lat: lat as number,
      lng: lng as number,
      tz: tz as string,
      city: city as string,
      filters: filters as number | undefined,
    });
    const token = encryptToken(payload);
    return Response.json({ token });
  } catch (err) {
    console.error('encode error', err instanceof Error ? err.message : String(err));
    return new Response('Encoding failed', { status: 500 });
  }
}
