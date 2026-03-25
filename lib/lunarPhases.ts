import * as Astronomy from 'astronomy-engine';
import type { TransitEvent } from '@/types/astro';
import { getInterpretation } from './interpretations';
import { getCalStrings } from './i18n/calendarStrings';

const ONE_HOUR = 60 * 60 * 1000;

export function getLunarPhaseEvents(windowStart: Date, windowMonths: number, locale?: string): TransitEvent[] {
  const strings = getCalStrings(locale);
  const events: TransitEvent[] = [];
  const windowEnd = new Date(windowStart);
  windowEnd.setMonth(windowEnd.getMonth() + windowMonths);

  let mq = Astronomy.SearchMoonQuarter(windowStart);

  while (mq.time.date <= windowEnd) {
    const phaseDate = mq.time.date;
    const phaseName = strings.phaseNames[mq.quarter];
    const phaseKey = strings.phaseKeys[mq.quarter];
    const phaseMech = `${phaseName} at ${phaseDate.toUTCString()}`;
    const phaseInterp = getInterpretation(phaseKey, locale);
    events.push({
      title: phaseName,
      description: `${strings.categoryLabels['lunar']}\n\n${phaseInterp ? `${phaseMech}\n\n${phaseInterp}` : phaseMech}`,
      startDate: phaseDate,
      endDate: new Date(phaseDate.getTime() + ONE_HOUR),
      exactDate: phaseDate,
      category: 'lunar',
    });
    mq = Astronomy.NextMoonQuarter(mq);
  }

  return events;
}
