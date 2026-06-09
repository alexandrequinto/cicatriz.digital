import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest): Promise<Response> {
  const q = request.nextUrl.searchParams.get('q');
  const locale = request.nextUrl.searchParams.get('locale');

  if (!q || q.trim().length < 2) {
    return Response.json({ error: 'q must be at least 2 characters' }, { status: 400 });
  }

  if (!locale || locale.trim().length === 0) {
    return Response.json({ error: 'locale is required' }, { status: 400 });
  }

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'cicatriz-digital',
      'Accept-Language': locale,
    },
  });

  if (!res.ok) {
    return Response.json({ error: 'Nominatim request failed' }, { status: 502 });
  }

  const data: unknown = await res.json();
  return Response.json(data);
}
