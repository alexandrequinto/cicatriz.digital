import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import Footer from '@/components/Footer';
import {
  getSkySnapshot,
  getLocalizedSignName,
  getSignSymbol,
  SIGN_SYMBOLS,
  EN_SIGNS,
  type PlanetPosition,
  type SkyAspect,
  type LunarPhaseNow,
} from '@/lib/skySnapshot';
import { getCalStrings } from '@/lib/i18n/calendarStrings';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'now' });
  return { title: t('pageTitle'), description: t('pageDescription') };
}

// --- SVG Zodiac Wheel ---

const CX = 140;
const CY = 140;
const R_OUTER = 126;   // outer border
const R_SIGN_INNER = 108; // inner edge of sign ring
const R_SIGN_GLYPH = 117; // sign glyph position
const R_PLANET = 82;   // planet glyph position
const R_CENTER_DOT = 4;

function lonToXY(lon: number, r: number): { x: number; y: number } {
  // 0° Aries at top (12 o'clock), increasing clockwise
  const rad = ((lon - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function ZodiacWheel({ positions }: { positions: PlanetPosition[] }) {
  const signLines = Array.from({ length: 12 }, (_, i) => {
    const angle = i * 30;
    const outer = lonToXY(angle, R_OUTER);
    const inner = lonToXY(angle, R_SIGN_INNER);
    return { outer, inner };
  });

  const signGlyphs = SIGN_SYMBOLS.map((sym, i) => {
    const angle = i * 30 + 15;
    const { x, y } = lonToXY(angle, R_SIGN_GLYPH);
    return { sym, x, y };
  });

  return (
    <svg
      viewBox="0 0 280 280"
      width="280"
      height="280"
      aria-hidden="true"
      className="mx-auto select-none"
    >
      {/* Outer ring */}
      <circle cx={CX} cy={CY} r={R_OUTER} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1" />
      {/* Sign ring inner boundary */}
      <circle cx={CX} cy={CY} r={R_SIGN_INNER} fill="none" stroke="currentColor" strokeOpacity="0.07" strokeWidth="0.75" />
      {/* Planet area inner boundary */}
      <circle cx={CX} cy={CY} r={48} fill="none" stroke="currentColor" strokeOpacity="0.05" strokeWidth="0.75" />

      {/* Sign dividers */}
      {signLines.map(({ outer, inner }, i) => (
        <line
          key={i}
          x1={inner.x} y1={inner.y}
          x2={outer.x} y2={outer.y}
          stroke="currentColor"
          strokeOpacity="0.12"
          strokeWidth="0.75"
        />
      ))}

      {/* Sign glyphs */}
      {signGlyphs.map(({ sym, x, y }, i) => (
        <text
          key={i}
          x={x} y={y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="9"
          fill="currentColor"
          fillOpacity="0.25"
        >
          {sym}
        </text>
      ))}

      {/* Planet glyphs */}
      {positions.map(({ planet, symbol, longitude, isRetrograde }) => {
        const { x, y } = lonToXY(longitude, R_PLANET);
        return (
          <text
            key={planet}
            x={x} y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="11"
            fill="currentColor"
            fillOpacity={isRetrograde ? 0.4 : 0.75}
          >
            {symbol}
          </text>
        );
      })}

      {/* Center dot */}
      <circle cx={CX} cy={CY} r={R_CENTER_DOT} fill="currentColor" fillOpacity="0.08" />
    </svg>
  );
}

// --- Helpers ---

function lunarPhaseLabel(phaseKey: string, locale: string): string {
  const strings = getCalStrings(locale);
  const map: Record<string, string> = {
    'New Moon': strings.moonIngressPhases[0],
    'Waxing Crescent': strings.moonIngressPhases[1],
    'First Quarter': strings.moonIngressPhases[2],
    'Waxing Gibbous': strings.moonIngressPhases[3],
    'Full Moon': strings.moonIngressPhases[4],
    'Waning Gibbous': strings.moonIngressPhases[5],
    'Last Quarter': strings.moonIngressPhases[6],
    'Waning Crescent': strings.moonIngressPhases[7],
  };
  return map[phaseKey] ?? phaseKey;
}

function formatDegree(degree: number, minute: number): string {
  return `${degree}°${minute.toString().padStart(2, '0')}′`;
}

// --- Page ---

interface NowPageProps {
  params: Promise<{ locale: string }>;
}

export default async function NowPage({ params }: NowPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'now' });
  const strings = getCalStrings(locale);

  const now = new Date();
  const snapshot = getSkySnapshot(now, locale);

  const utcString = now.toUTCString().replace(' GMT', ' UTC');

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 w-full max-w-sm mx-auto px-5 pt-12 pb-10 space-y-10">

        {/* Header */}
        <div className="space-y-1">
          <Link href="/" className="text-[10px] uppercase tracking-[0.2em] text-foreground/25 hover:text-foreground/60 transition-colors">
            ← Cicatriz
          </Link>
          <h1 className="text-xs uppercase tracking-[0.25em] text-foreground/50 pt-2">
            {t('title')}
          </h1>
          <p className="text-[10px] text-foreground/20 uppercase tracking-widest">
            {t('asOf')} {utcString}
          </p>
        </div>

        {/* Zodiac Wheel */}
        <section>
          <ZodiacWheel positions={snapshot.positions} />
        </section>

        {/* Lunar phase */}
        <section className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.25em] text-foreground/25 border-b border-foreground/8 pb-2">
            {t('lunarPhase')}
          </p>
          <div className="flex items-baseline gap-3">
            <span className="text-base text-foreground/60">
              {snapshot.lunarPhase.illumination < 0.5 && snapshot.lunarPhase.elongation < 180 ? '🌒' :
               snapshot.lunarPhase.illumination < 0.5 && snapshot.lunarPhase.elongation >= 180 ? '🌘' :
               snapshot.lunarPhase.elongation < 22.5 || snapshot.lunarPhase.elongation >= 337.5 ? '🌑' :
               snapshot.lunarPhase.elongation >= 157.5 && snapshot.lunarPhase.elongation < 202.5 ? '🌕' :
               snapshot.lunarPhase.illumination >= 0.95 ? '🌕' : '🌔'}
            </span>
            <span className="text-xs text-foreground/60">
              {lunarPhaseLabel(snapshot.lunarPhase.phaseKey, locale)}
            </span>
            <span className="text-[10px] text-foreground/25 ml-auto">
              {Math.round(snapshot.lunarPhase.illumination * 100)}%
            </span>
          </div>
        </section>

        {/* Planet positions */}
        <section className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.25em] text-foreground/25 border-b border-foreground/8 pb-2">
            {t('planets')}
          </p>
          <div className="space-y-1.5">
            {snapshot.positions.map(({ planet, symbol, signKey, degree, minute, isRetrograde }) => {
              const signName = getLocalizedSignName(signKey, locale);
              const planetName = strings.planets[planet] ?? planet;
              return (
                <div key={planet} className="flex items-baseline gap-2 text-xs">
                  <span className="text-foreground/40 w-4 text-center">{symbol}</span>
                  <span className="text-foreground/50 w-20">{planetName}</span>
                  <span className="text-foreground/65">{formatDegree(degree, minute)}</span>
                  <span className="text-foreground/40">{getSignSymbol(EN_SIGNS.indexOf(signKey))}</span>
                  <span className="text-foreground/35">{signName}</span>
                  {isRetrograde && (
                    <span className="text-foreground/25 ml-auto text-[10px]">℞</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Active aspects */}
        <section className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.25em] text-foreground/25 border-b border-foreground/8 pb-2">
            {t('aspects')}
          </p>
          {snapshot.aspects.length === 0 ? (
            <p className="text-[10px] text-foreground/25">{t('noAspects')}</p>
          ) : (
            <div className="space-y-1.5">
              {snapshot.aspects.map(({ planet1, planet2, aspectName, aspectSymbol, separation }) => {
                const p1 = strings.planets[planet1] ?? planet1;
                const p2 = strings.planets[planet2] ?? planet2;
                const asp = strings.aspects[aspectName] ?? aspectName;
                return (
                  <div key={`${planet1}-${planet2}`} className="flex items-baseline gap-2 text-xs">
                    <span className="text-foreground/40 w-4 text-center">{aspectSymbol}</span>
                    <span className="text-foreground/55">{p1}</span>
                    <span className="text-foreground/25">{asp}</span>
                    <span className="text-foreground/55">{p2}</span>
                    <span className="text-foreground/20 ml-auto text-[10px]">
                      {separation.toFixed(1)}°
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>

      <Footer />
    </div>
  );
}
