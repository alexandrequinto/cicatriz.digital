import Link from 'next/link';
import { useTranslations } from 'next-intl';
import NatalChartForm from '@/components/NatalChartForm';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import Footer from '@/components/Footer';

export default function Home() {
  const t = useTranslations('home');

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
          <div className="flex items-center justify-between mb-5">
            <div className="flex gap-3 select-none" aria-hidden="true">
              {['♄','☽','♃','☿','♀','♂'].map(s => (
                <span key={s} className="text-xl text-foreground/20 leading-none">{s}</span>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <Link href="/now" className="text-[10px] uppercase tracking-[0.2em] text-foreground/30 hover:text-foreground/60 transition-colors">
                {t('headerNow')}
              </Link>
              <LocaleSwitcher />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase">
            Cicatriz
          </h1>
          <p className="text-xs text-foreground/35 mt-1 uppercase tracking-[0.25em]">
            {t('tagline')}
          </p>
          <p className="text-xs text-foreground/25 mt-4 leading-relaxed">
            {t('description')}
          </p>
        </section>

        <NatalChartForm />
      </main>

      <Footer />
    </div>
  );
}
