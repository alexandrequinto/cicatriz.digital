import type { Metadata } from 'next';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'faq' });
  return { title: t('pageTitle'), description: t('pageDescription') };
}

interface QAProps { q: string; children: React.ReactNode }
function QA({ q, children }: QAProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/40">{q}</p>
      <div className="text-xs text-foreground/65 leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5">
      <p className="text-[10px] uppercase tracking-[0.25em] text-foreground/25 border-b border-foreground/8 pb-2">{title}</p>
      {children}
    </section>
  );
}

export default function FaqPage() {
  const t = useTranslations('faq');
  const tResult = useTranslations('result');

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 w-full max-w-sm mx-auto px-5 pt-12 pb-10 space-y-10">

        <div className="space-y-1">
          <Link href="/" className="text-[10px] uppercase tracking-[0.2em] text-foreground/25 hover:text-foreground/60 transition-colors">
            ← Cicatriz
          </Link>
          <h1 className="text-xs uppercase tracking-[0.25em] text-foreground/50 pt-2">
            {t('title')}
          </h1>
        </div>

        <Section title={t('s1Title')}>
          <QA q={t('q1')}><p>{t('a1')}</p></QA>
          <QA q={t('q2')}><p>{t('a2')}</p></QA>
          <QA q={t('q3')}><p>{t('a3')}</p></QA>
          <QA q={t('q4')}>
            <p><span className="text-foreground/40 uppercase tracking-widest text-[9px]">{t('a4OuterLabel')}</span> — {t('a4Outer')}</p>
            <p><span className="text-foreground/40 uppercase tracking-widest text-[9px]">{t('a4InnerLabel')}</span> — {t('a4Inner')}</p>
            <p><span className="text-foreground/40 uppercase tracking-widest text-[9px]">{t('a4LunarLabel')}</span> — {t('a4Lunar')}</p>
            <p><span className="text-foreground/40 uppercase tracking-widest text-[9px]">{t('a4IngressLabel')}</span> — {t('a4Ingress')}</p>
            <p><span className="text-foreground/40 uppercase tracking-widest text-[9px]">{t('a4RetrogradeLabel')}</span> — {t('a4Retrograde')}</p>
          </QA>
          <QA q={t('q5')}><p>{t('a5')}</p></QA>
          <QA q={t('q6')}><p>{t('a6')}</p></QA>
        </Section>

        <Section title={t('s2Title')}>
          <QA q={t('q7')}><p>{t('a7')}</p></QA>
          <QA q={t('q8')}><p>{t('a8')}</p></QA>
          <QA q={t('q9')}><p>{t('a9')}</p></QA>
          <QA q={t('q10')}><p>{t('a10')}</p></QA>
        </Section>

        <Section title={t('s3Title')}>
          <QA q={t('q11')}><p>{t('a11')}</p></QA>
          <QA q={t('q12')}><p>{t('a12')}</p></QA>
          <QA q={t('q13')}><p>{t('a13')}</p></QA>
        </Section>

        <Section title={t('s4Title')}>
          <QA q={t('q14')}><p>{t('a14')}</p></QA>
          <QA q={t('q15')}><p>{t('a15')}</p></QA>
          <QA q={t('q16')}><p>{t('a16')}</p></QA>
        </Section>

      </main>

      <footer className="px-5 py-5 border-t border-foreground/8">
        <p className="text-[10px] text-foreground/20 uppercase tracking-widest text-center">
          {tResult('footerNoStorage')}
        </p>
      </footer>
    </div>
  );
}
