'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { track } from '@vercel/analytics';
import CitySearch from '@/components/CitySearch';
import { encodeBirthData, FILTER_BITS, ALL_FILTERS } from '@/lib/birthData';

interface FormErrors {
  name?: string;
  date?: string;
  city?: string;
}

const fieldLabel = 'block text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1.5';
const fieldInput = 'w-full bg-black border border-white/20 text-white text-sm px-3 py-2 focus:outline-none focus:border-white/70 transition-colors placeholder:text-white/20';

const FILTER_OPTIONS = [
  { bit: FILTER_BITS['outer-transit'], label: 'Slow transits ♄♃',       hint: 'Jupiter · Saturn · Uranus · Neptune · Pluto' },
  { bit: FILTER_BITS['inner-transit'], label: 'Personal transits ☿♀',   hint: 'Sun · Mercury · Venus · Mars · frequent' },
  { bit: FILTER_BITS['lunar'],         label: 'Lunar phases ☽',          hint: 'New Moon · Full Moon · quarters' },
  { bit: FILTER_BITS['ingress'],       label: 'Sign ingresses ♈',        hint: 'Planets entering new signs' },
  { bit: FILTER_BITS['retrograde'],    label: 'Retrograde stations ℞',   hint: '' },
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
      track('form_submit');
      router.push('/result?data=' + token);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className={fieldLabel}>Name</label>
        <input
          id="name" type="text" value={name}
          onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
          required autoComplete="given-name" placeholder="Your name"
          aria-invalid={!!errors.name}
          className={fieldInput}
        />
        {errors.name && <p className="mt-1 text-[10px] text-white/50">{errors.name}</p>}
      </div>

      {/* Date + Time — stack on mobile, side-by-side on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-hidden">
        <div className="min-w-0">
          <label htmlFor="date" className={fieldLabel}>Birth date</label>
          <input
            id="date" type="date" value={date} max={today}
            onChange={(e) => { setDate(e.target.value); setErrors((p) => ({ ...p, date: undefined })); }}
            required aria-invalid={!!errors.date}
            className={fieldInput + ' [color-scheme:dark]'}
          />
          {errors.date && <p className="mt-1 text-[10px] text-white/50">{errors.date}</p>}
        </div>

        <div className="min-w-0">
          <label htmlFor="time" className={fieldLabel}>
            Birth time <span className="text-white/20 normal-case tracking-normal">optional</span>
          </label>
          <input
            id="time" type="time" value={time} disabled={unknownTime}
            onChange={(e) => setTime(e.target.value)}
            className={fieldInput + ' [color-scheme:dark] disabled:opacity-25 disabled:cursor-not-allowed'}
          />
          <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
            <input
              type="checkbox" checked={unknownTime}
              onChange={(e) => { setUnknownTime(e.target.checked); if (e.target.checked) setTime(''); }}
              className="w-3 h-3 accent-white"
            />
            <span className="text-[10px] uppercase tracking-[0.15em] text-white/30">Unknown</span>
          </label>
        </div>
      </div>

      {/* City */}
      <div>
        <label className={fieldLabel}>Birth city</label>
        <CitySearch onSelect={handleCitySelect} />
        {errors.city && <p className="mt-1 text-[10px] text-white/50">{errors.city}</p>}
      </div>

      {/* Divider */}
      <div className="border-t border-white/8" />

      {/* Filters */}
      <div>
        <p className={fieldLabel}>Include in calendar</p>
        <div className="space-y-3 mt-2">
          {FILTER_OPTIONS.map(({ bit, label, hint }) => {
            const checked = (filters & bit) !== 0;
            return (
              <label key={bit} className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => setFilters(checked ? filters & ~bit : filters | bit)}
                  className="mt-px w-3 h-3 accent-white shrink-0"
                />
                <span className="text-xs text-white/70 leading-snug">
                  {label}
                  {hint && <span className="text-white/25 ml-2 text-[10px]">{hint}</span>}
                </span>
              </label>
            );
          })}
        </div>
        {filters === 0 && (
          <p className="mt-3 text-[10px] text-white/40 uppercase tracking-widest">
            No types selected — calendar will be empty
          </p>
        )}
      </div>

      <button
        type="submit" disabled={isSubmitting}
        className="w-full bg-white text-black text-xs uppercase tracking-[0.2em] py-3 hover:bg-white/90 transition-colors focus:outline-none focus:ring-1 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Generating…' : 'Generate calendar'}
      </button>
    </form>
  );
}
