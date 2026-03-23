import Link from 'next/link';
import { decodeBirthData } from '@/lib/birthData';
import SubscribeUrl from '@/components/SubscribeUrl';

interface ResultPageProps {
  searchParams: Promise<{ data?: string }>;
}

export default async function ResultPage({ searchParams }: ResultPageProps) {
  const { data } = await searchParams;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';

  if (!data) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center px-4">
        <p className="text-stone-500 text-sm mb-3">No calendar data found.</p>
        <Link href="/" className="text-amber-500 hover:text-amber-400 text-sm">← Generate a calendar</Link>
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
      <div className="flex flex-col min-h-screen items-center justify-center px-4">
        <p className="text-stone-500 text-sm mb-3">Invalid data. Please try again.</p>
        <Link href="/" className="text-amber-500 hover:text-amber-400 text-sm">← Generate a calendar</Link>
      </div>
    );
  }

  const subscribeUrl = `${appUrl}/api/ical?data=${data}`;

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-8 space-y-5">
        <div className="space-y-1">
          <Link href="/" className="text-xs text-stone-500 hover:text-stone-300 transition-colors">
            ← cicatriz.digital
          </Link>
          <h1 className="text-xl font-semibold text-stone-100">Calendar ready</h1>
          <p className="text-sm text-stone-400">Subscribe to receive your personalized transits.</p>
        </div>

        {noTime && (
          <div role="note" className="flex gap-2 border border-stone-700 rounded-lg px-3 py-2.5">
            <span className="text-stone-400 text-sm" aria-hidden="true">☽</span>
            <p className="text-xs text-stone-400">
              No birth time provided — Moon transits are estimated using solar noon.
            </p>
          </div>
        )}

        <SubscribeUrl subscribeUrl={subscribeUrl} name={birthData.name} />
      </main>

      <footer className="px-4 py-4 text-center">
        <p className="text-xs text-stone-600">No account. No storage. Your data lives only in your URL.</p>
      </footer>
    </div>
  );
}
