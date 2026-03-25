'use client';

import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

const LOCALES = [
  { code: 'en',    flag: '🇬🇧', label: 'EN' },
  { code: 'pt-BR', flag: '🇧🇷', label: 'PT-BR' },
];

export default function LocaleSwitcher() {
  const pathname = usePathname();
  const locale = useLocale();

  const hrefFor = (code: string) => {
    const withoutLocale = pathname.replace(/^\/pt-BR/, '') || '/';
    return code === 'en' ? withoutLocale : '/pt-BR' + withoutLocale;
  };

  return (
    <div className="relative flex items-center gap-3 justify-end z-10">
      {LOCALES.map(({ code, flag, label }) => (
        <a
          key={code}
          href={hrefFor(code)}
          className={`flex items-center gap-1.5 text-[10px] uppercase tracking-widest transition-colors cursor-pointer ${
            locale === code
              ? 'text-foreground/60 pointer-events-none'
              : 'text-foreground/20 hover:text-foreground/40'
          }`}
        >
          <span className="text-sm leading-none">{flag}</span>
          {label}
        </a>
      ))}
    </div>
  );
}
