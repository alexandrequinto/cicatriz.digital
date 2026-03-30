import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import Footer from '@/components/Footer';
import ZodiacWheel from '@/components/ZodiacWheel';
import {
  getSkySnapshot,
  getLocalizedSignName,
  getSignSymbol,
  EN_SIGNS,
} from '@/lib/skySnapshot';
import { getCalStrings } from '@/lib/i18n/calendarStrings';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'now' });
  return { title: t('pageTitle'), description: t('pageDescription') };
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

  const wheelPositions = snapshot.positions.map((p) => ({
    ...p,
    localizedName: strings.planets[p.planet] ?? p.planet,
    localizedSign: getLocalizedSignName(p.signKey, locale),
  }));

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
          <ZodiacWheel positions={wheelPositions} localizedSigns={strings.signs} />
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
