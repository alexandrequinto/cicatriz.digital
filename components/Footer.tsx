import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('home');

  return (
    <footer className="px-5 py-5 border-t border-foreground/8 space-y-2">
      <p className="text-[10px] text-foreground/20 uppercase tracking-widest text-center">
        {t('footerNoStorage')}
      </p>
      <p className="text-[10px] text-foreground/30 uppercase tracking-widest text-center space-x-4">
        <Link href="/faq" className="hover:text-foreground/60 transition-colors">{t('footerHowItWorks')}</Link>
        <Link href="/privacy" className="hover:text-foreground/60 transition-colors">{t('footerPrivacy')}</Link>
        <a href="mailto:feedback@cicatriz.digital" className="hover:text-foreground/60 transition-colors">{t('footerFeedback')}</a>
        <a href="https://github.com/alexandrequinto/cicatriz.digital" target="_blank" rel="noopener noreferrer" className="hover:text-foreground/60 transition-colors">{t('footerSource')}</a>
      </p>
    </footer>
  );
}
