import Link from 'next/link';
import { useTranslations } from 'next-intl';
import NatalChartForm from '@/components/NatalChartForm';
import LocaleSwitcher from '@/components/LocaleSwitcher';

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
            <LocaleSwitcher />
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

      <footer className="px-5 py-5 border-t border-foreground/8 space-y-2">
        <p className="text-[10px] text-foreground/40 uppercase tracking-widest text-center">
          {t('footerNoStorage')}
        </p>
        <p className="text-[10px] text-foreground/30 uppercase tracking-widest text-center space-x-4">
          <Link href="/faq" className="hover:text-foreground/60 transition-colors">{t('footerHowItWorks')}</Link>
          <a href="mailto:feedback@cicatriz.digital" className="hover:text-foreground/60 transition-colors">{t('footerFeedback')}</a>
        </p>
      </footer>
    </div>
  );
}
