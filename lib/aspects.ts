export const ASPECTS = [
  { name: 'conjunct',   angle: 0,   symbol: '☌' },
  { name: 'sextile',    angle: 60,  symbol: '⚹' },
  { name: 'square',     angle: 90,  symbol: '□' },
  { name: 'trine',      angle: 120, symbol: '△' },
  { name: 'opposition', angle: 180, symbol: '☍' },
] as const;

export type AspectName = typeof ASPECTS[number]['name'];

export const PLANET_ORB: Record<string, number> = {
  Sun: 8, Moon: 8,
  Mercury: 6, Venus: 6, Mars: 6,
  Jupiter: 7, Saturn: 7,
  Uranus: 5, Neptune: 5, Pluto: 4,
};

export function angularDifference(a: number, b: number): number {
  let diff = Math.abs(a - b) % 360;
  if (diff > 180) diff = 360 - diff;
  return diff;
}

export function detectAspect(lon1: number, lon2: number, planet1: string, planet2: string) {
  const diff = angularDifference(lon1, lon2);
  const orb = (PLANET_ORB[planet1] + PLANET_ORB[planet2]) / 2;
  for (const aspect of ASPECTS) {
    if (Math.abs(diff - aspect.angle) <= orb) {
      return { ...aspect, separation: Math.abs(diff - aspect.angle), orb };
    }
  }
  return null;
}
