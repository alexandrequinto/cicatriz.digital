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

const ONE_HOUR = 60 * 60 * 1000;

function lunarEclipseEvent(info: LunarEclipseInfo): TransitEvent {
  const peak = info.peak.date;
  const kindLabel = info.kind.charAt(0).toUpperCase() + info.kind.slice(1);
  const title = `${kindLabel} Lunar Eclipse ☽`;
  const mech = `${kindLabel} lunar eclipse — Moon passes through Earth's shadow`;
  const interp = getInterpretation(`Lunar Eclipse|${info.kind}`);
  return {
    title,
    description: `Eclipse\n\n${interp ? `${mech}\n\n${interp}` : mech}`,
    startDate: peak,
    endDate: new Date(peak.getTime() + ONE_HOUR),
    exactDate: peak,
    category: 'eclipse',
  };
}

function solarEclipseEvent(info: GlobalSolarEclipseInfo): TransitEvent {
  const peak = info.peak.date;
  const kindLabel = info.kind.charAt(0).toUpperCase() + info.kind.slice(1);
  const title = `${kindLabel} Solar Eclipse ☀`;
  const mech = `${kindLabel} solar eclipse — Moon passes between Earth and the Sun`;
  const interp = getInterpretation(`Solar Eclipse|${info.kind}`);
  return {
    title,
    description: `Eclipse\n\n${interp ? `${mech}\n\n${interp}` : mech}`,
    startDate: peak,
    endDate: new Date(peak.getTime() + ONE_HOUR),
    exactDate: peak,
    category: 'eclipse',
  };
}

export function getEclipseEvents(windowStart: Date, windowMonths: number): TransitEvent[] {
  const events: TransitEvent[] = [];
  const windowEnd = new Date(windowStart);
  windowEnd.setMonth(windowEnd.getMonth() + windowMonths);

  // Lunar eclipses
  let lunar = SearchLunarEclipse(windowStart);
  while (lunar.peak.date <= windowEnd) {
    events.push(lunarEclipseEvent(lunar));
    lunar = NextLunarEclipse(lunar.peak);
  }

  // Solar eclipses
  let solar = SearchGlobalSolarEclipse(windowStart);
  while (solar.peak.date <= windowEnd) {
    events.push(solarEclipseEvent(solar));
    solar = NextGlobalSolarEclipse(solar.peak);
  }

  return events;
}
