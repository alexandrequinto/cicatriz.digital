import type { BirthData } from '@/types/astro';

type Payload = {
  n: string;
  d: string;
  t: string;
  a: number;
  o: number;
  z: string;
  c: string;
};

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
  return Buffer.from(JSON.stringify(payload))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function decodeBirthData(token: string): BirthData {
  try {
    const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(base64, 'base64').toString('utf8');
    const payload: Payload = JSON.parse(json);
    return {
      name: payload.n,
      date: payload.d,
      time: payload.t || null,
      lat: payload.a,
      lng: payload.o,
      tz: payload.z,
      city: payload.c,
    };
  } catch {
    throw new Error('Invalid token');
  }
}
