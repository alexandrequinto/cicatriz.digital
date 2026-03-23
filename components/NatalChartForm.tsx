'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CitySearch from '@/components/CitySearch';
import { encodeBirthData, FILTER_BITS, ALL_FILTERS } from '@/lib/birthData';

interface FormErrors {
  name?: string;
  date?: string;
  city?: string;
}

const input = 'w-full bg-stone-900 border border-stone-700 text-stone-100 placeholder-stone-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500';
const label = 'block text-xs font-medium text-stone-400 mb-1';

const FILTER_OPTIONS = [
  { bit: FILTER_BITS['outer-transit'], label: 'Slow transits ♄♃', hint: '(Jupiter, Saturn, Uranus, Neptune, Pluto)' },
  { bit: FILTER_BITS['inner-transit'], label: 'Personal transits ☿♀', hint: '(Sun, Mercury, Venus, Mars — frequent)' },
  { bit: FILTER_BITS['lunar'],         label: 'Lunar phases ☽',       hint: '(New Moon, Full Moon, quarters)' },
  { bit: FILTER_BITS['ingress'],       label: 'Sign ingresses ♈',     hint: '(planets entering new signs)' },
  { bit: FILTER_BITS['retrograde'],    label: 'Retrograde stations ℞', hint: '' },
] as const;

export default function NatalChartForm() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [unknownTime, setUnknownTime] = useState(false);
  const [city, setCity] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [tz, setTz] = useState('');
  const [filters, setFilters] = useState(ALL_FILTERS);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const handleCitySelect = (cityName: string, selectedLat: number, selectedLng: number, selectedTz: string) => {
    setCity(cityName);
    setLat(selectedLat);
    setLng(selectedLng);
    setTz(selectedTz);
    setErrors((prev) => ({ ...prev, city: undefined }));
  };

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!name.trim()) errs.name = 'Required';
    if (!date) errs.date = 'Required';
    if (!city || lat === null || lng === null || !tz) errs.city = 'Select a city from the results';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setIsSubmitting(true);
    try {
      const token = encodeBirthData({
        name: name.trim(), date,
        time: unknownTime || !time ? null : time,
        lat: lat!, lng: lng!, tz, city,
        filters,
      });
      router.push('/result?data=' + token);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="border border-stone-800 rounded-xl p-4 space-y-4">
      <div>
        <label htmlFor="name" className={label}>Name</label>
        <input
          id="name" type="text" value={name}
          onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
          required autoComplete="given-name" placeholder="Your name"
          aria-invalid={!!errors.name}
          className={input}
        />
        {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="date" className={label}>Birth date</label>
          <input
            id="date" type="date" value={date} max={today}
            onChange={(e) => { setDate(e.target.value); setErrors((p) => ({ ...p, date: undefined })); }}
            required aria-invalid={!!errors.date}
            className={input + ' [color-scheme:dark]'}
          />
          {errors.date && <p className="mt-1 text-xs text-red-400">{errors.date}</p>}
        </div>

        <div>
          <label htmlFor="time" className={label}>
            Birth time <span className="text-stone-600">(optional)</span>
          </label>
          <input
            id="time" type="time" value={time} disabled={unknownTime}
            onChange={(e) => setTime(e.target.value)}
            className={input + ' [color-scheme:dark] disabled:opacity-40 disabled:cursor-not-allowed'}
          />
          <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer select-none">
            <input
              type="checkbox" checked={unknownTime}
              onChange={(e) => { setUnknownTime(e.target.checked); if (e.target.checked) setTime(''); }}
              className="w-3.5 h-3.5 rounded accent-amber-500"
            />
            <span className="text-xs text-stone-500">Unknown</span>
          </label>
        </div>
      </div>

      <div>
        <label className={label}>Birth city</label>
        <CitySearch onSelect={handleCitySelect} />
        {errors.city && <p className="mt-1 text-xs text-red-400">{errors.city}</p>}
      </div>

      <div>
        <p className={label}>Include in calendar</p>
        <div className="space-y-2 mt-1">
          {FILTER_OPTIONS.map(({ bit, label: optLabel, hint }) => {
            const checked = (filters & bit) !== 0;
            return (
              <label key={bit} className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => setFilters(checked ? filters & ~bit : filters | bit)}
                  className="mt-0.5 w-3.5 h-3.5 rounded accent-amber-500 shrink-0"
                />
                <span className="text-xs text-stone-300 leading-snug">
                  {optLabel}
                  {hint && <span className="text-stone-600 ml-1">{hint}</span>}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <button
        type="submit" disabled={isSubmitting}
        className="w-full bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold rounded-md py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-stone-950 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Generating…' : 'Generate calendar'}
      </button>
    </form>
  );
}
