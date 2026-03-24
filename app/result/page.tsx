import Link from 'next/link';
import { headers } from 'next/headers';
import { decodeBirthData, encodeBirthData } from '@/lib/birthData';
import { getPreviewEvents } from '@/lib/previewEvents';
import SubscribeUrl from '@/components/SubscribeUrl';

interface ResultPageProps {
  searchParams: Promise<{ data?: string }>;
}

function formatPreviewDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function truncateCity(city: string, maxLen = 40): string {
  return city.length > maxLen ? city.slice(0, maxLen - 1) + '…' : city;
}

export default async function ResultPage({ searchParams }: ResultPageProps) {
  const { data } = await searchParams;

  const headersList = await headers();
  const host = headersList.get('host') ?? 'cicatriz.digital';
  const proto = headersList.get('x-forwarded-proto') ?? 'https';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `${proto}://${host}`;

  if (!data) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center px-5">
        <p className="text-white/30 text-xs uppercase tracking-widest mb-4">No calendar data found.</p>
        <Link href="/" className="text-xs uppercase tracking-[0.15em] text-white/50 hover:text-white transition-colors">
          ← Cicatriz
        </Link>
      </div>
    );
  }

  let birthData;
  let noTime = false;
  try {
    birthData = decodeBirthData(data);
    noTime = !birthData.time;
  } catch {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center px-5">
        <p className="text-white/30 text-xs uppercase tracking-widest mb-4">
          This calendar link appears to be damaged or expired.
        </p>
        <p className="text-white/30 text-xs uppercase tracking-widest mb-4">
          Re-enter your birth data to generate a new one, or go back to the result page if you saved it.
        </p>
        <Link href="/" className="text-xs uppercase tracking-[0.15em] text-white/50 hover:text-white transition-colors">
          ← Cicatriz
        </Link>
      </div>
    );
  }

  // Re-encode server-side so the subscribe URL always carries a signed token,
  // even when the client submitted an unsigned one (HMAC_SECRET not in browser).
  const signedData = encodeBirthData(birthData);
  const subscribeUrl = `${appUrl}/api/ical?data=${signedData}`;

  // Compute preview events (server-side, no external calls)
  let previewEvents: Awaited<ReturnType<typeof getPreviewEvents>> = [];
  try {
    previewEvents = getPreviewEvents(birthData);
  } catch {
    // Non-fatal — preview section simply won't render if computation fails
  }

  const birthDateFormatted = new Date(birthData.date + 'T12:00:00Z').toLocaleDateString('en-US', {
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
          <Link href="/" className="text-[10px] uppercase tracking-[0.2em] text-white/25 hover:text-white/60 transition-colors">
            ← Cicatriz
          </Link>
          <div className="pt-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-1">Calendar ready</p>
            <p className="text-white/50 text-xs">{birthData.name}</p>
          </div>
        </div>

        {/* Birth data confirmation card */}
        <div className="border border-white/10 px-3 py-3 space-y-2">
          <div className="flex items-baseline justify-between">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Calendar for</p>
            <Link
              href="/"
              className="text-[10px] uppercase tracking-[0.15em] text-white/30 hover:text-white/60 transition-colors"
            >
              ← edit
            </Link>
          </div>
          <div>
            <p className="text-xs text-white/70 font-mono">{birthData.name}</p>
            <p className="text-[10px] text-white/50 font-mono mt-0.5">
              {birthDateFormatted} · {timeLabel} · {cityLabel}
            </p>
          </div>
        </div>

        {noTime && (
          <div role="note" className="border border-white/10 px-3 py-2.5 flex gap-3">
            <span className="text-white/30 text-sm shrink-0" aria-hidden="true">☽</span>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.12em] leading-relaxed">
              No birth time — Moon transits estimated using solar noon
            </p>
          </div>
        )}

        {/* Upcoming events preview */}
        {previewEvents.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Upcoming</p>
            <div className="border border-white/10 divide-y divide-white/8">
              {previewEvents.map((event, i) => (
                <div key={i} className="flex items-baseline gap-3 px-3 py-2">
                  <span className="text-[10px] text-white/50 font-mono shrink-0 w-10">
                    {formatPreviewDate(event.startDate)}
                  </span>
                  <span className="text-[10px] text-white/70 font-mono leading-snug">
                    {event.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <SubscribeUrl subscribeUrl={subscribeUrl} name={birthData.name} />
      </main>

      <footer className="px-5 py-5 border-t border-white/8">
        <p className="text-[10px] text-white/20 uppercase tracking-widest text-center">
          No account · No storage · Your data lives only in your URL
        </p>
      </footer>
    </div>
  );
}
