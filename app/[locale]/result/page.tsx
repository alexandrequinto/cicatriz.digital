import Link from 'next/link';
import { headers } from 'next/headers';
import { getTranslations, getLocale } from 'next-intl/server';
import { decodeBirthData, encodeBirthData } from '@/lib/birthData';
import { verifyToken } from '@/lib/tokenSigning';
import { decryptToken, isEncryptedToken, encryptToken } from '@/lib/encryption';
import { getPreviewEvents } from '@/lib/previewEvents';
import SubscribeUrl from '@/components/SubscribeUrl';
import Footer from '@/components/Footer';

interface ResultPageProps {
  searchParams: Promise<{ data?: string }>;
}

function truncateCity(city: string, maxLen = 40): string {
  return city.length > maxLen ? city.slice(0, maxLen - 1) + '…' : city;
}

export default async function ResultPage({ searchParams }: ResultPageProps) {
  const { data } = await searchParams;
  const locale = await getLocale();
  const t = await getTranslations('result');

  const headersList = await headers();
  const host = headersList.get('host') ?? 'cicatriz.digital';
  const proto = headersList.get('x-forwarded-proto') ?? 'https';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `${proto}://${host}`;

  if (!data) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center px-5">
        <p className="text-foreground/30 text-xs uppercase tracking-widest mb-4">{t('noData')}</p>
        <Link href="/" className="text-xs uppercase tracking-[0.15em] text-foreground/50 hover:text-foreground transition-colors">
          ← Cicatriz
        </Link>
      </div>
    );
  }

  let birthData;
  let noTime = false;
  let resolvedToken: string;
  try {
    if (isEncryptedToken(data)) {
      const payload = decryptToken(data);
      birthData = decodeBirthData(payload);
      resolvedToken = data;
    } else {
      const { payload } = verifyToken(data);
      birthData = decodeBirthData(payload);
      resolvedToken = encryptToken(encodeBirthData(birthData));
    }
    noTime = !birthData.time;
  } catch {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center px-5">
        <p className="text-foreground/30 text-xs uppercase tracking-widest mb-4">{t('damaged')}</p>
        <p className="text-foreground/30 text-xs uppercase tracking-widest mb-4">{t('reEnter')}</p>
        <Link href="/" className="text-xs uppercase tracking-[0.15em] text-foreground/50 hover:text-foreground transition-colors">
          ← Cicatriz
        </Link>
      </div>
    );
  }

  const subscribeUrl = `${appUrl}/api/ical?data=${resolvedToken}`;

  let previewEvents: Awaited<ReturnType<typeof getPreviewEvents>> = [];
  try {
    previewEvents = getPreviewEvents(birthData);
  } catch {
    // Non-fatal
  }

  const birthDateFormatted = new Date(birthData.date + 'T12:00:00Z').toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeLabel = birthData.time ?? 'birth time unknown';
  const cityLabel = truncateCity(birthData.city);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 w-full max-w-sm mx-auto px-5 pt-12 pb-10 space-y-8">
        <div className="space-y-1">
          <Link href="/" className="text-[10px] uppercase tracking-[0.2em] text-foreground/25 hover:text-foreground/60 transition-colors">
            ← Cicatriz
          </Link>
          <div className="pt-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/30 mb-1">{t('ready')}</p>
            <p className="text-foreground/50 text-xs">{birthData.name}</p>
          </div>
        </div>

        {/* Birth data confirmation card */}
        <div className="border border-foreground/10 px-3 py-3 space-y-2">
          <div className="flex items-baseline justify-between">
            <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/35">{t('calendarFor')}</p>
            <Link href="/" className="text-[10px] uppercase tracking-[0.15em] text-foreground/30 hover:text-foreground/60 transition-colors">
              {t('edit')}
            </Link>
          </div>
          <div>
            <p className="text-xs text-foreground/70 font-mono">{birthData.name}</p>
            <p className="text-[10px] text-foreground/50 font-mono mt-0.5">
              {birthDateFormatted} · {timeLabel} · {cityLabel}
            </p>
          </div>
        </div>

        {noTime && (
          <div role="note" className="border border-foreground/10 px-3 py-2.5 flex gap-3">
            <span className="text-foreground/30 text-sm shrink-0" aria-hidden="true">☽</span>
            <p className="text-[10px] text-foreground/30 uppercase tracking-[0.12em] leading-relaxed">
              {t('noTime')}
            </p>
          </div>
        )}

        {/* Upcoming events preview */}
        {previewEvents.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/35">{t('upcoming')}</p>
            <div className="border border-foreground/10 divide-y divide-foreground/8">
              {previewEvents.map((event, i) => (
                <div key={i} className="flex items-baseline gap-3 px-3 py-2">
                  <span className="text-[10px] text-foreground/50 font-mono shrink-0 w-10">
                    {event.startDate.toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-[10px] text-foreground/70 font-mono leading-snug">
                    {event.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <SubscribeUrl subscribeUrl={subscribeUrl} name={birthData.name} />
      </main>

      <Footer />
    </div>
  );
}
