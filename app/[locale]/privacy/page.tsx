import type { Metadata } from 'next';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'privacy' });
  return { title: t('pageTitle'), description: t('pageDescription') };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <p className="text-[10px] uppercase tracking-[0.25em] text-foreground/25 border-b border-foreground/8 pb-2">{title}</p>
      {children}
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-foreground/65 leading-relaxed">{children}</p>;
}

export default function PrivacyPage() {
  const t = useTranslations('privacy');
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
          <P>{t('s1p1')}</P>
          <P>{t('s1p2')}</P>
        </Section>

        <Section title={t('s2Title')}>
          <P>{t('s2p1')}</P>
          <P>{t('s2p2')}</P>
          <P>{t('s2p3')}</P>
        </Section>

        <Section title={t('s3Title')}>
          <P>{t('s3p1')}</P>
          <P>{t('s3p2')}</P>
        </Section>

        <Section title={t('s4Title')}>
          <P>{t('s4p1')}</P>
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
