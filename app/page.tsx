import NatalChartForm from '@/components/NatalChartForm';

const features = [
  { symbol: '♄♃', label: 'Planetary transits' },
  { symbol: '☽', label: 'Lunar phases' },
  { symbol: '♈', label: 'Sign ingresses & retrogrades' },
  { symbol: '↺', label: 'Updates automatically' },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-8 space-y-6">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'cicatriz.digital',
              url: 'https://cicatriz.digital',
              description: 'Personalized astrological transits delivered to Google Calendar based on your natal chart.',
              applicationCategory: 'LifestyleApplication',
              operatingSystem: 'Web',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            }),
          }}
        />
        <section className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight text-stone-100">
            cicatriz.<span className="text-amber-500">digital</span>
          </h1>
          <p className="text-sm text-stone-400 leading-relaxed max-w-sm">
            Personalized astrological transits in your calendar — based on your natal chart.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            {features.map(({ symbol, label }) => (
              <li key={label} className="flex items-center gap-1.5 text-xs text-stone-500">
                <span className="text-stone-400">{symbol}</span>
                {label}
              </li>
            ))}
          </ul>
        </section>

        <NatalChartForm />
      </main>

      <footer className="px-4 py-4 text-center">
        <p className="text-xs text-stone-600">
          No account. No storage. Your data lives only in your URL.
        </p>
      </footer>
    </div>
  );
}
