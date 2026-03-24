import { describe, it, expect } from 'vitest';
import { getIngressAndRetrogradeEvents } from '@/lib/ingresses';

// Mercury Rx Apr 9 – May 3 2025; Aug 23 – Sep 15 2025; Dec 25 2025 – Jan 14 2026
const WINDOW_START = new Date('2025-01-01T00:00:00Z');

describe('getIngressAndRetrogradeEvents — retrograde spans', () => {
  it('retrograde events are multi-day spans, not 1-hour points', () => {
    const events = getIngressAndRetrogradeEvents(WINDOW_START, 12);
    const rxEvents = events.filter(e => e.title.includes('Retrograde'));
    expect(rxEvents.length).toBeGreaterThan(0);
    for (const ev of rxEvents) {
      const durationMs = ev.endDate.getTime() - ev.startDate.getTime();
      expect(durationMs).toBeGreaterThan(7 * 24 * 60 * 60 * 1000); // > 7 days
    }
  });

  it('direct station events remain 1-hour point events', () => {
    const events = getIngressAndRetrogradeEvents(WINDOW_START, 12);
    const directEvents = events.filter(e => e.title.includes('Direct'));
    expect(directEvents.length).toBeGreaterThan(0);
    for (const ev of directEvents) {
      const durationMs = ev.endDate.getTime() - ev.startDate.getTime();
      expect(durationMs).toBe(60 * 60 * 1000);
    }
  });

  it('retrograde exactDate equals startDate (UID stability on calendar refresh)', () => {
    const events = getIngressAndRetrogradeEvents(WINDOW_START, 12);
    for (const ev of events.filter(e => e.title.includes('Retrograde'))) {
      expect(ev.exactDate.getTime()).toBe(ev.startDate.getTime());
    }
  });

  it('Mercury has at least 2 retrograde spans in a 12-month window', () => {
    const events = getIngressAndRetrogradeEvents(WINDOW_START, 12);
    const mercuryRx = events.filter(e => e.title === 'Mercury Retrograde ℞');
    expect(mercuryRx.length).toBeGreaterThanOrEqual(2);
  });

  it('each retrograde endDate is after its startDate', () => {
    const events = getIngressAndRetrogradeEvents(WINDOW_START, 12);
    for (const ev of events.filter(e => e.title.includes('Retrograde'))) {
      expect(ev.endDate.getTime()).toBeGreaterThan(ev.startDate.getTime());
    }
  });

  it('retrograde endDate does not exceed windowEnd when window ends mid-retrograde', () => {
    // Mercury Rx: Mar 16 – Apr 8 2025. Window Mar 1 – Apr 1 captures Rx start but not direct.
    const start = new Date('2025-03-01T00:00:00Z');
    const windowEnd = new Date(start);
    windowEnd.setMonth(windowEnd.getMonth() + 1);
    const events = getIngressAndRetrogradeEvents(start, 1);
    for (const ev of events.filter(e => e.title.includes('Retrograde'))) {
      expect(ev.endDate.getTime()).toBeLessThanOrEqual(windowEnd.getTime());
    }
  });

  it('direct station without a preceding Rx in the window still emits the direct event', () => {
    // Mercury Rx started Mar 16 2025; window starts Mar 20 (after Rx), ends Apr 30 (after direct Apr 8).
    // No Rx station is detected in the window, but the direct station should still emit.
    const start = new Date('2025-03-20T00:00:00Z');
    const events = getIngressAndRetrogradeEvents(start, 2);
    const directEvents = events.filter(e => e.title === 'Mercury Direct ↻');
    expect(directEvents.length).toBeGreaterThanOrEqual(1);
    for (const ev of directEvents) {
      const durationMs = ev.endDate.getTime() - ev.startDate.getTime();
      expect(durationMs).toBe(60 * 60 * 1000);
    }
  });

  it('all events have a category of ingress or retrograde', () => {
    const events = getIngressAndRetrogradeEvents(WINDOW_START, 3);
    for (const ev of events) {
      expect(['ingress', 'retrograde']).toContain(ev.category);
    }
  });
});
