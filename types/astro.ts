export interface BirthData {
  name: string;
  date: string;       // ISO "YYYY-MM-DD"
  time: string | null; // "HH:MM" or null
  lat: number;
  lng: number;
  tz: string;         // IANA timezone e.g. "America/New_York"
  city: string;
  // Bitmask of enabled event categories. Absent = all enabled (legacy tokens).
  // bit 0 (1): outer-transit, bit 1 (2): inner-transit, bit 2 (4): lunar,
  // bit 3 (8): ingress, bit 4 (16): retrograde. All enabled = 31.
  filters?: number;
}

export interface NatalPlanet {
  name: string;        // "Sun", "Moon", etc.
  longitude: number;   // 0-360 geocentric ecliptic
}

export interface TransitEvent {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  exactDate: Date;
  category: 'outer-transit' | 'inner-transit' | 'lunar' | 'ingress' | 'retrograde';
}
