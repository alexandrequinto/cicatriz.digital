'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface CitySearchProps {
  onSelect: (city: string, lat: number, lng: number, tz: string) => void;
}

export default function CitySearch({ onSelect }: CitySearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedLabel, setSelectedLabel] = useState('');

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1`,
        { headers: { 'User-Agent': 'astro-ical-app' } }
      );
      if (!res.ok) throw new Error('Network error');
      const data: NominatimResult[] = await res.json();
      setResults(data);
      setIsOpen(data.length > 0);
      setActiveIndex(-1);
    } catch {
      setError('Search failed, try again');
      setResults([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedLabel('');

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => search(val), 400);
  };

  const handleSelect = async (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const label = result.display_name.length > 50
      ? result.display_name.slice(0, 50) + '…'
      : result.display_name;

    setIsLoading(true);
    setError(null);
    setIsOpen(false);
    setQuery(label);
    setSelectedLabel(label);

    try {
      const tzRes = await fetch(`/api/timezone?lat=${lat}&lng=${lng}`);
      if (!tzRes.ok) throw new Error('Timezone fetch failed');
      const tzData = await tzRes.json();
      onSelect(result.display_name, lat, lng, tzData.timezone);
    } catch {
      setError('Search failed, try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(results[activeIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Search city..."
          autoComplete="off"
          aria-label="Birth city search"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          className="w-full bg-slate-900 border border-purple-700 text-purple-100 placeholder-purple-400/60 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent pr-10"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              className="animate-spin h-4 w-4 text-amber-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-400" role="alert">
          {error}
        </p>
      )}

      {isOpen && results.length > 0 && (
        <ul
          role="listbox"
          aria-label="City suggestions"
          className="absolute z-50 w-full mt-1 bg-slate-900 border border-purple-700 rounded-lg shadow-xl overflow-hidden"
        >
          {results.map((result, index) => {
            const label =
              result.display_name.length > 50
                ? result.display_name.slice(0, 50) + '…'
                : result.display_name;
            return (
              <li
                key={result.place_id}
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={() => handleSelect(result)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                  index === activeIndex
                    ? 'bg-purple-800/60 text-amber-300'
                    : 'text-purple-100 hover:bg-purple-800/40'
                }`}
              >
                {label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
