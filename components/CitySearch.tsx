'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    suburb?: string;
    state?: string;
    region?: string;
    country?: string;
  };
}

interface CitySearchProps {
  onSelect: (city: string, lat: number, lng: number, tz: string) => void;
}

export default function CitySearch({ onSelect }: CitySearchProps) {
  const t = useTranslations('citySearch');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); setIsOpen(false); return; }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1`,
        { headers: { 'User-Agent': 'cicatriz-digital' } }
      );
      if (!res.ok) throw new Error();
      const data: NominatimResult[] = await res.json();
      setResults(data);
      setIsOpen(data.length > 0);
      setActiveIndex(-1);
    } catch {
      setError(t('searchFailed'));
      setResults([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => search(val), 400);
  };

  const handleSelect = async (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const label = result.display_name.length > 60 ? result.display_name.slice(0, 60) + '…' : result.display_name;
    const previousQuery = query; // store before overwriting
    setIsLoading(true);
    setError(null);
    setIsOpen(false);
    setQuery(label);
    try {
      const tzRes = await fetch(`/api/timezone?lat=${lat}&lng=${lng}`);
      if (!tzRes.ok) throw new Error();
      const tzData = await tzRes.json();
      onSelect(result.display_name, lat, lng, tzData.timezone);
    } catch {
      setQuery(previousQuery); // restore so form knows city isn't selected
      setError(t('timezoneFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && activeIndex >= 0) { e.preventDefault(); handleSelect(results[activeIndex]); }
    else if (e.key === 'Escape') setIsOpen(false);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text" value={query} onChange={handleChange} onKeyDown={handleKeyDown}
          placeholder={t('placeholder')} autoComplete="off"
          aria-label={t('ariaLabel')} aria-expanded={isOpen} aria-haspopup="listbox"
          className="w-full bg-background border border-foreground/20 text-foreground placeholder:text-foreground/20 px-3 py-2 text-sm focus:outline-none focus:border-foreground/70 transition-colors pr-8"
        />
        {isLoading && (
          <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin h-3.5 w-3.5 text-foreground/30" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
      </div>

      {error && <p className="mt-1 text-[10px] text-foreground/50">{error}</p>}

      {isOpen && results.length > 0 && (
        <ul role="listbox" className="absolute z-50 w-full mt-1 bg-background border border-foreground/20 shadow-xl overflow-hidden">
          {results.map((result, index) => {
            const isActive = index === activeIndex;
            const addr = result.address;
            const primaryName = addr
              ? (addr.city ?? addr.town ?? addr.village ?? addr.municipality ?? addr.suburb ?? result.display_name.split(',')[0].trim())
              : result.display_name.split(',')[0].trim();
            const secondaryParts = addr
              ? [addr.state ?? addr.region, addr.country].filter((v): v is string => Boolean(v))
              : [];
            const secondary = secondaryParts.join(', ');
            return (
              <li
                key={result.place_id} role="option" aria-selected={isActive}
                onMouseDown={() => handleSelect(result)} onMouseEnter={() => setActiveIndex(index)}
                className={`px-3 py-2.5 cursor-pointer text-xs transition-colors flex flex-col leading-tight ${isActive ? 'bg-foreground text-background' : 'text-foreground/60 hover:bg-foreground/8'}`}
              >
                <span>{primaryName}</span>
                {secondary && (
                  <span className={isActive ? 'text-background/60' : 'text-foreground/40'}>{secondary}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
