import * as Astronomy from 'astronomy-engine';
import type { TransitEvent } from '@/types/astro';

const PHASE_NAMES = ['New Moon 🌑', 'First Quarter 🌓', 'Full Moon 🌕', 'Last Quarter 🌗'];
const ONE_HOUR = 60 * 60 * 1000;

export function getLunarPhaseEvents(windowStart: Date, windowMonths: number): TransitEvent[] {
  const events: TransitEvent[] = [];
  const windowEnd = new Date(windowStart);
  windowEnd.setMonth(windowEnd.getMonth() + windowMonths);

  let mq = Astronomy.SearchMoonQuarter(windowStart);

  while (mq.time.date <= windowEnd) {
    const phaseDate = mq.time.date;
    events.push({
      title: PHASE_NAMES[mq.quarter],
      description: `${PHASE_NAMES[mq.quarter]} at ${phaseDate.toUTCString()}`,
      startDate: phaseDate,
      endDate: new Date(phaseDate.getTime() + ONE_HOUR),
      exactDate: phaseDate,
      category: 'lunar',
    });
    mq = Astronomy.NextMoonQuarter(mq);
  }

  return events;
}
