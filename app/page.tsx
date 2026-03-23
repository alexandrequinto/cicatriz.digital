import NatalChartForm from '@/components/NatalChartForm';

const features = [
  { icon: '🪐', label: 'Major planetary transits' },
  { icon: '🌕', label: 'Lunar phases' },
  { icon: '♈', label: 'Sign ingresses & retrogrades' },
  { icon: '♻️', label: 'Auto-updates every 6 hours' },
];

export default function Home() {
  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-12 sm:py-20 space-y-10">
        <section className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-purple-100 leading-tight">
            Your Personal{' '}
            <span className="text-amber-400">Astrology Calendar</span>
          </h1>
          <p className="text-lg text-purple-300 max-w-lg mx-auto leading-relaxed">
            Get personalized planetary transits, lunar phases, and sign ingresses
            delivered directly to your Google Calendar — based on your birth chart.
          </p>
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 pt-2">
            {features.map(({ icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-1.5 text-sm text-purple-300"
              >
                <span aria-hidden="true">{icon}</span>
                {label}
              </li>
            ))}
          </ul>
        </section>

        <NatalChartForm />
      </main>

      <footer className="text-center py-6 px-4">
        <p className="text-xs text-purple-500">
          Free, no account needed. Your birth data is encoded in your URL only.
        </p>
      </footer>
    </div>
  );
}
