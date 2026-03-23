import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get('lat');
  const lng = request.nextUrl.searchParams.get('lng');

  if (!lat || !lng) {
    return Response.json({ error: 'Missing lat/lng' }, { status: 400 });
  }

  const latN = parseFloat(lat);
  const lngN = parseFloat(lng);
  if (isNaN(latN) || isNaN(lngN)) {
    return Response.json({ error: 'Invalid lat/lng' }, { status: 400 });
  }

  const res = await fetch(
    `https://timeapi.io/api/timezone/coordinate?latitude=${latN}&longitude=${lngN}`,
    { next: { revalidate: 86400 } } // cache 24h — timezone for a location never changes
  );

  if (!res.ok) {
    return Response.json({ error: 'Timezone lookup failed' }, { status: 502 });
  }

  const data = await res.json();
  return Response.json({ timezone: data.timeZone });
}
