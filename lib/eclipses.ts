import {
  SearchLunarEclipse,
  NextLunarEclipse,
  SearchGlobalSolarEclipse,
  NextGlobalSolarEclipse,
  type LunarEclipseInfo,
  type GlobalSolarEclipseInfo,
} from 'astronomy-engine';
import type { TransitEvent } from '@/types/astro';
import { getInterpretation } from './interpretations';
import { getCalStrings } from './i18n/calendarStrings';

const ONE_HOUR = 60 * 60 * 1000;

function lunarEclipseEvent(info: LunarEclipseInfo, locale?: string): TransitEvent {
  const strings = getCalStrings(locale);
  const peak = info.peak.date;
  const kindLabel = info.kind.charAt(0).toUpperCase() + info.kind.slice(1);
  const title = `${kindLabel} ${strings.lunarEclipse}`;
  const mech = `${kindLabel} lunar eclipse — Moon passes through Earth's shadow`;
  const interp = getInterpretation(`Lunar Eclipse|${info.kind}`, locale);
  return {
    title,
    description: `${strings.categoryLabels['eclipse']}\n\n${interp ? `${mech}\n\n${interp}` : mech}`,
    startDate: peak,
    endDate: new Date(peak.getTime() + ONE_HOUR),
    exactDate: peak,
    category: 'eclipse',
  };
}

function solarEclipseEvent(info: GlobalSolarEclipseInfo, locale?: string): TransitEvent {
  const strings = getCalStrings(locale);
  const peak = info.peak.date;
  const kindLabel = info.kind.charAt(0).toUpperCase() + info.kind.slice(1);
  const title = `${kindLabel} ${strings.solarEclipse}`;
  const mech = `${kindLabel} solar eclipse — Moon passes between Earth and the Sun`;
  const interp = getInterpretation(`Solar Eclipse|${info.kind}`, locale);
  return {
    title,
    description: `${strings.categoryLabels['eclipse']}\n\n${interp ? `${mech}\n\n${interp}` : mech}`,
    startDate: peak,
    endDate: new Date(peak.getTime() + ONE_HOUR),
    exactDate: peak,
    category: 'eclipse',
  };
}

export function getEclipseEvents(windowStart: Date, windowMonths: number, locale?: string): TransitEvent[] {
  const events: TransitEvent[] = [];
  const windowEnd = new Date(windowStart);
  windowEnd.setMonth(windowEnd.getMonth() + windowMonths);

  // Lunar eclipses
  let lunar = SearchLunarEclipse(windowStart);
  while (lunar.peak.date <= windowEnd) {
    events.push(lunarEclipseEvent(lunar, locale));
    lunar = NextLunarEclipse(lunar.peak);
  }

  // Solar eclipses
  let solar = SearchGlobalSolarEclipse(windowStart);
  while (solar.peak.date <= windowEnd) {
    events.push(solarEclipseEvent(solar, locale));
    solar = NextGlobalSolarEclipse(solar.peak);
  }

  return events;
}
