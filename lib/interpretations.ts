import enData from './transitInterpretations.json';

const enInterps: Record<string, string> = enData as Record<string, string>;
const localeCache: Record<string, Record<string, string>> = {};

function loadLocaleInterps(locale: string): Record<string, string> {
  if (localeCache[locale]) return localeCache[locale];
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const data = require(`./transitInterpretations.${locale}.json`);
    localeCache[locale] = data as Record<string, string>;
    return localeCache[locale];
  } catch {
    localeCache[locale] = {};
    return {};
  }
}

export function getInterpretation(key: string, locale?: string): string {
  if (locale && locale !== 'en') {
    const localeInterps = loadLocaleInterps(locale);
    if (localeInterps[key]) return localeInterps[key];
  }
  return enInterps[key] ?? '';
}
