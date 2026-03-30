import { getPlanetLongitude, ALL_PLANETS, type PlanetName } from './ephemeris';
import { detectAspect, ASPECTS } from './aspects';
import { getCalStrings } from './i18n/calendarStrings';

export const PLANET_SYMBOLS: Record<PlanetName, string> = {
  Sun: '☀',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '⛢',
  Neptune: '♆',
  Pluto: '♇',
};

const SIGN_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

// English sign names used as stable keys throughout
const EN_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

export interface PlanetPosition {
  planet: PlanetName;
  symbol: string;
  longitude: number;   // 0–360
  signIndex: number;   // 0–11
  signKey: string;     // English, stable key e.g. "Aries"
  degree: number;      // 0–29 within the sign
  minute: number;      // 0–59
  isRetrograde: boolean;
}

export interface SkyAspect {
  planet1: PlanetName;
  planet2: PlanetName;
  aspectName: string;
  aspectSymbol: string;
  separation: number;  // degrees from exact
}

export interface LunarPhaseNow {
  phaseKey: string;    // English key: 'New Moon', 'Full Moon', etc.
  elongation: number;  // Moon elongation from Sun in degrees 0–360
  illumination: number; // 0–1 approximate
}

export interface SkySnapshot {
  timestamp: Date;
  positions: PlanetPosition[];
  aspects: SkyAspect[];
  lunarPhase: LunarPhaseNow;
}

function getSignIndex(lon: number): number {
  return Math.floor(((lon % 360) + 360) % 360 / 30);
}

function getLunarPhaseKey(elongation: number): string {
  if (elongation < 22.5 || elongation >= 337.5) return 'New Moon';
  if (elongation < 67.5)  return 'Waxing Crescent';
  if (elongation < 112.5) return 'First Quarter';
  if (elongation < 157.5) return 'Waxing Gibbous';
  if (elongation < 202.5) return 'Full Moon';
  if (elongation < 247.5) return 'Waning Gibbous';
  if (elongation < 292.5) return 'Last Quarter';
  return 'Waning Crescent';
}

function approximateIllumination(elongation: number): number {
  // Approximate fraction of Moon disk illuminated (0–1)
  return (1 - Math.cos((elongation * Math.PI) / 180)) / 2;
}

export function getSkySnapshot(date: Date, locale?: string): SkySnapshot {
  const strings = getCalStrings(locale);
  const yesterday = new Date(date.getTime() - 24 * 60 * 60 * 1000);

  const positions: PlanetPosition[] = ALL_PLANETS.map((planet) => {
    const lon = getPlanetLongitude(planet, date);
    const lonYesterday = getPlanetLongitude(planet, yesterday);
    const signIndex = getSignIndex(lon);
    const degreeRaw = ((lon % 360) + 360) % 360 - signIndex * 30;
    const degree = Math.floor(degreeRaw);
    const minute = Math.floor((degreeRaw - degree) * 60);

    // Retrograde: longitude is decreasing (accounting for wrap-around)
    const delta = lon - lonYesterday;
    const normDelta = delta > 180 ? delta - 360 : delta < -180 ? delta + 360 : delta;
    const isRetrograde = planet !== 'Sun' && planet !== 'Moon' && normDelta < 0;

    return {
      planet,
      symbol: PLANET_SYMBOLS[planet],
      longitude: lon,
      signIndex,
      signKey: EN_SIGNS[signIndex],
      degree,
      minute,
      isRetrograde,
    };
  });

  // Compute all unique planet pair aspects
  const aspects: SkyAspect[] = [];
  for (let i = 0; i < ALL_PLANETS.length; i++) {
    for (let j = i + 1; j < ALL_PLANETS.length; j++) {
      const p1 = ALL_PLANETS[i];
      const p2 = ALL_PLANETS[j];
      const lon1 = positions[i].longitude;
      const lon2 = positions[j].longitude;
      const detected = detectAspect(lon1, lon2, p1, p2);
      if (detected) {
        const aspectDef = ASPECTS.find(a => a.name === detected.name);
        aspects.push({
          planet1: p1,
          planet2: p2,
          aspectName: detected.name,
          aspectSymbol: aspectDef?.symbol ?? '',
          separation: detected.separation,
        });
      }
    }
  }

  // Sort aspects by tightness (closest to exact first)
  const sortedAspects = [...aspects].sort((a, b) => a.separation - b.separation);

  const moonLon = getPlanetLongitude('Moon', date);
  const sunLon = getPlanetLongitude('Sun', date);
  const elongation = ((moonLon - sunLon) % 360 + 360) % 360;

  return {
    timestamp: date,
    positions,
    aspects: sortedAspects,
    lunarPhase: {
      phaseKey: getLunarPhaseKey(elongation),
      elongation,
      illumination: approximateIllumination(elongation),
    },
  };
}

// Returns sign name in the requested locale
export function getLocalizedSignName(signKey: string, locale?: string): string {
  const strings = getCalStrings(locale);
  const idx = EN_SIGNS.indexOf(signKey);
  return idx >= 0 ? strings.signs[idx] : signKey;
}

export function getSignSymbol(signIndex: number): string {
  return SIGN_SYMBOLS[signIndex] ?? '';
}

export { EN_SIGNS, SIGN_SYMBOLS };
