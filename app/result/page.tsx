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
      <div className="flex flex-col flex-1 min-h-screen items-center justify-center px-4">
        <p className="text-purple-300 text-sm mb-4">No calendar data found.</p>
        <Link
          href="/"
          className="text-amber-400 hover:text-amber-300 text-sm underline underline-offset-4"
        >
          ← Generate another calendar
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
      <div className="flex flex-col flex-1 min-h-screen items-center justify-center px-4">
        <p className="text-purple-300 text-sm mb-4">
          Invalid calendar data. Please try again.
        </p>
        <Link
          href="/"
          className="text-amber-400 hover:text-amber-300 text-sm underline underline-offset-4"
        >
          ← Generate another calendar
        </Link>
      </div>
    );
  }

  const subscribeUrl = `${appUrl}/api/ical?data=${data}`;

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-12 sm:py-20 space-y-8">
        <div className="space-y-2">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-purple-400 hover:text-amber-400 transition-colors"
          >
            ← Generate another calendar
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-purple-100">
            Your calendar is ready
          </h1>
          <p className="text-purple-300">
            Subscribe to start receiving personalized astrology events.
          </p>
        </div>

        {noTime && (
          <div
            role="note"
            className="flex gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3"
          >
            <span className="text-amber-400 text-lg" aria-hidden="true">
              🌙
            </span>
            <p className="text-sm text-amber-200 leading-relaxed">
              Moon transits are estimated since no birth time was provided.
            </p>
          </div>
        )}

        <SubscribeUrl subscribeUrl={subscribeUrl} name={birthData.name} />
      </main>

      <footer className="text-center py-6 px-4">
        <p className="text-xs text-purple-500">
          Free, no account needed. Your birth data is encoded in your URL only.
        </p>
      </footer>
    </div>
  );
}
