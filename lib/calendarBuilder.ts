import ical, { ICalEventTransparency } from 'ical-generator';
import type { BirthData, TransitEvent } from '@/types/astro';

export function buildCalendar(birth: BirthData, events: TransitEvent[]) {
  const cal = ical({
    name: `${birth.name}'s Astrology`,
    description: `Personalized transits for ${birth.name}, born ${birth.date} in ${birth.city}`,
    timezone: birth.tz,
    prodId: { company: 'astro-ical', product: 'Astro iCal', language: 'EN' },
  });

  cal.x([
    { key: 'X-PUBLISHED-TTL', value: 'PT6H' },
    { key: 'X-WR-CALNAME', value: `${birth.name}'s Astrology` },
    { key: 'X-WR-CALDESC', value: `Personalized transits for ${birth.name}` },
  ]);

  const allDayCategories = new Set<TransitEvent['category']>(['lunar', 'ingress', 'retrograde']);

  for (const event of events) {
    const isAllDay = allDayCategories.has(event.category);
    cal.createEvent({
      start: event.startDate,
      end: event.endDate,
      summary: event.title,
      description: event.description,
      allDay: isAllDay,
      transparency: ICalEventTransparency.TRANSPARENT,
    });
  }

  return cal;
}
