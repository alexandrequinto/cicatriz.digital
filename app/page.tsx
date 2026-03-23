import NatalChartForm from '@/components/NatalChartForm';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Cicatriz',
            url: 'https://cicatriz.digital',
            description: 'Your natal chart, delivered to your calendar. Personalized planetary transits and lunar phases — no account needed.',
            applicationCategory: 'LifestyleApplication',
            operatingSystem: 'Web',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }),
        }}
      />

      <main className="flex-1 w-full max-w-sm mx-auto px-5 pt-12 pb-10 space-y-10">
        {/* Hero */}
        <section>
          <div className="flex gap-3 mb-5 select-none" aria-hidden="true">
            {['♄','☽','♃','☿','♀','♂'].map(s => (
              <span key={s} className="text-xl text-white/20 leading-none">{s}</span>
            ))}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white uppercase">
            Cicatriz
          </h1>
          <p className="text-xs text-white/35 mt-1 uppercase tracking-[0.25em]">
            Marked by the cosmos
          </p>
        </section>

        <NatalChartForm />
      </main>

      <footer className="px-5 py-5 border-t border-white/8">
        <p className="text-[10px] text-white/25 uppercase tracking-widest text-center">
          No account · No storage · Your data lives only in your URL
        </p>
      </footer>
    </div>
  );
}
