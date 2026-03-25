import ical, { ICalEventTransparency } from 'ical-generator';
import { createHash } from 'node:crypto';
import type { BirthData, TransitEvent } from '@/types/astro';
import { getCalStrings } from './i18n/calendarStrings';

export function buildCalendar(birth: BirthData, events: TransitEvent[], tokenHash: string) {
  const strings = getCalStrings(birth.locale);
  const calName = strings.calendarNameTemplate.replace('{name}', birth.name);
  const calDesc = strings.calendarDescTemplate
    .replace('{name}', birth.name)
    .replace('{date}', birth.date)
    .replace('{city}', birth.city);

  const cal = ical({
    name: calName,
    description: calDesc,
    timezone: birth.tz,
    prodId: { company: 'cicatriz.digital', product: 'cicatriz', language: 'EN' },
  });

  cal.x([
    { key: 'X-PUBLISHED-TTL', value: 'PT6H' },
    { key: 'X-WR-CALNAME', value: calName },
    { key: 'X-WR-CALDESC', value: calDesc },
  ]);

  const allDayCategories = new Set<TransitEvent['category']>(['outer-transit', 'inner-transit', 'lunar', 'ingress', 'retrograde']);

  const CATEGORY_COLORS: Record<TransitEvent['category'], string> = {
    'outer-transit': '#4682B4',
    'inner-transit': '#20B2AA',
    'lunar':         '#708090',
    'ingress':       '#2E8B57',
    'retrograde':    '#DC143C',
    'eclipse':       '#8B008B',
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
    ev.x('X-APPLE-CALENDAR-COLOR', CATEGORY_COLORS[event.category]);
  }

  return cal;
}
