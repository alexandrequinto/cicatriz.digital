import type { BirthData } from '@/types/astro';

type Payload = {
  n: string;
  d: string;
  t: string;
  a: number;
  o: number;
  z: string;
  c: string;
  f?: number; // event category filter bitmask (absent = all enabled)
  l?: string; // locale (omitted for 'en' to keep tokens backward-compatible)
};

export const FILTER_BITS = {
  'outer-transit': 1,
  'inner-transit': 2,
  'lunar': 4,
  'ingress': 8,
  'retrograde': 16,
  'eclipse': 32,
} as const;

export const ALL_FILTERS = 63; // all 6 bits set

function toBase64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Encodes birth data into a base64url token (unsigned).
 * Signing is done server-side via lib/tokenSigning.ts — never client-side.
 */
export function encodeBirthData(data: BirthData): string {
  const payload: Payload = {
    n: data.name,
    d: data.date,
    t: data.time ?? '',
    a: parseFloat(data.lat.toFixed(4)),
    o: parseFloat(data.lng.toFixed(4)),
    z: data.tz,
    c: data.city,
  };
  // Only encode filters if not all enabled (keeps legacy URLs unchanged)
  if (data.filters != null && data.filters !== ALL_FILTERS) {
    payload.f = data.filters;
  }
  // Only encode locale for non-English (keeps tokens backward-compatible)
  if (data.locale && data.locale !== 'en') {
    payload.l = data.locale;
  }
  return toBase64url(Buffer.from(JSON.stringify(payload)));
}

/**
 * Decodes a raw base64url payload into BirthData.
 * Callers that need signature verification should call verifyToken (lib/tokenSigning.ts)
 * first to extract the payload, then pass it here.
 */
export function decodeBirthData(payload: string): BirthData {
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(base64, 'base64').toString('utf8');
    const p: Payload = JSON.parse(json);
    return {
      name: p.n,
      date: p.d,
      time: p.t || null,
      lat: p.a,
      lng: p.o,
      tz: p.z,
      city: p.c,
      filters: p.f,
      locale: p.l,
    };
  } catch {
    throw new Error('Invalid token');
  }
}
