import ical, { ICalEventTransparency } from 'ical-generator';
import { createHash } from 'node:crypto';
import type { BirthData, TransitEvent } from '@/types/astro';

export function buildCalendar(birth: BirthData, events: TransitEvent[], tokenHash: string) {
  const cal = ical({
    name: `${birth.name}'s Astrology`,
    description: `Personalized transits for ${birth.name}, born ${birth.date} in ${birth.city}`,
    timezone: birth.tz,
    prodId: { company: 'cicatriz.digital', product: 'cicatriz', language: 'EN' },
  });

  cal.x([
    { key: 'X-PUBLISHED-TTL', value: 'PT6H' },
    { key: 'X-WR-CALNAME', value: `${birth.name}'s Astrology` },
    { key: 'X-WR-CALDESC', value: `Personalized transits for ${birth.name}` },
  ]);

  const allDayCategories = new Set<TransitEvent['category']>(['lunar', 'ingress', 'retrograde']);

  for (const event of events) {
    const isAllDay = allDayCategories.has(event.category);
    const uid = createHash('sha1')
      .update(`${tokenHash}|${event.title}|${event.exactDate.toISOString().slice(0, 10)}`)
      .digest('hex')
      .slice(0, 24) + '@cicatriz.digital';
    cal.createEvent({
      start: event.startDate,
      end: event.endDate,
      summary: event.title,
      description: event.description,
      allDay: isAllDay,
      transparency: ICalEventTransparency.TRANSPARENT,
      id: uid,
    });
  }

  return cal;
}
