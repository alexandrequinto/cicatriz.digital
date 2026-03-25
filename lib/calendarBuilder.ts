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

  const allDayCategories = new Set<TransitEvent['category']>(['outer-transit', 'inner-transit', 'lunar', 'ingress', 'retrograde']);

  const CATEGORY_COLORS: Record<TransitEvent['category'], { rfc: string; apple: string }> = {
    'outer-transit': { rfc: 'steelblue',  apple: '#4682B4' },
    'inner-transit': { rfc: 'teal',       apple: '#20B2AA' },
    'lunar':         { rfc: 'slategray',  apple: '#708090' },
    'ingress':       { rfc: 'seagreen',   apple: '#2E8B57' },
    'retrograde':    { rfc: 'crimson',    apple: '#DC143C' },
  };

  for (const event of events) {
    const isAllDay = allDayCategories.has(event.category);
    const uid = createHash('sha1')
      .update(`${tokenHash}|${event.category}|${event.title}|${event.exactDate.toISOString().slice(0, 10)}`)
      .digest('hex')
      .slice(0, 24) + '@cicatriz.digital';
    const ev = cal.createEvent({
      start: event.startDate,
      end: event.endDate,
      summary: event.title,
      description: event.description,
      allDay: isAllDay,
      transparency: ICalEventTransparency.TRANSPARENT,
      id: uid,
    });
    const colors = CATEGORY_COLORS[event.category];
    ev.x([
      { key: 'COLOR', value: colors.rfc },
      { key: 'X-APPLE-CALENDAR-COLOR', value: colors.apple },
    ]);
  }

  return cal;
}
