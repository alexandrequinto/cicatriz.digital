import type { BirthData, TransitEvent } from '@/types/astro';
import { getNatalPositions } from './ephemeris';
import { getOuterTransits } from './transits';
import { getPersonalTransits } from './personalTransits';
import { getIngressAndRetrogradeEvents } from './ingresses';
import { getLunarPhaseEvents } from './lunarPhases';
import { FILTER_BITS } from './birthData';

const PREVIEW_MONTHS = 3;

/**
 * Returns the next 5 upcoming transit events starting from now.
 * Respects the birthData.filters bitmask (absent = all categories enabled).
 * Window is 3 months — sufficient to guarantee events for any user.
 */
export function getPreviewEvents(birthData: BirthData): TransitEvent[] {
  const now = new Date();
  const natal = getNatalPositions(birthData);

  const outerTransits = getOuterTransits(natal, now, PREVIEW_MONTHS);
  const innerTransits = getPersonalTransits(natal, now, PREVIEW_MONTHS);
  const lunarEvents = getLunarPhaseEvents(now, PREVIEW_MONTHS);
  const ingressEvents = getIngressAndRetrogradeEvents(now, PREVIEW_MONTHS);

  const allEvents: TransitEvent[] = [
    ...outerTransits,
    ...innerTransits,
    ...lunarEvents,
    ...ingressEvents,
  ];

  // Apply category filter if specified; absent (legacy tokens) = all enabled
  const activeFilters = birthData.filters;
  const filteredEvents = activeFilters != null
    ? allEvents.filter(e => (activeFilters & FILTER_BITS[e.category]) !== 0)
    : allEvents;

  // Keep only events starting from now, sort chronologically, take first 5
  filteredEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  return filteredEvents.slice(0, 5);
}
