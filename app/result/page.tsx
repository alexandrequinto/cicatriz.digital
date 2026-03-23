import Link from 'next/link';
import { headers } from 'next/headers';
import { decodeBirthData } from '@/lib/birthData';
import SubscribeUrl from '@/components/SubscribeUrl';

interface ResultPageProps {
  searchParams: Promise<{ data?: string }>;
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
        <p className="text-white/30 text-xs uppercase tracking-widest mb-4">Invalid data. Please try again.</p>
        <Link href="/" className="text-xs uppercase tracking-[0.15em] text-white/50 hover:text-white transition-colors">
          ← Cicatriz
        </Link>
      </div>
    );
  }

  const subscribeUrl = `${appUrl}/api/ical?data=${data}`;

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

        {noTime && (
          <div role="note" className="border border-white/10 px-3 py-2.5 flex gap-3">
            <span className="text-white/30 text-sm shrink-0" aria-hidden="true">☽</span>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.12em] leading-relaxed">
              No birth time — Moon transits estimated using solar noon
            </p>
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
