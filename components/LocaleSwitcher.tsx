'use client';

import { useLocale } from 'next-intl';
import { track } from '@vercel/analytics';

const LOCALES = [
  { code: 'en',    flag: '🇬🇧', label: 'EN' },
  { code: 'pt-BR', flag: '🇧🇷', label: 'PT-BR' },
];

export default function LocaleSwitcher() {
  const locale = useLocale();

  return (
    <div className="relative flex items-center gap-3 justify-end z-10">
      {LOCALES.map(({ code, flag, label }) => (
        <a
          key={code}
          href={`/${code}`}
          onClick={() => track('locale_switch', { to: code, from: locale })}
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
