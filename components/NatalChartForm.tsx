'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CitySearch from '@/components/CitySearch';
import { encodeBirthData } from '@/lib/birthData';

interface FormErrors {
  name?: string;
  date?: string;
  city?: string;
}

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
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const handleCitySelect = (
    cityName: string,
    selectedLat: number,
    selectedLng: number,
    selectedTz: string
  ) => {
    setCity(cityName);
    setLat(selectedLat);
    setLng(selectedLng);
    setTz(selectedTz);
    setErrors((prev) => ({ ...prev, city: undefined }));
  };

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!name.trim()) errs.name = 'Your name is required.';
    if (!date) errs.date = 'Birth date is required.';
    if (!city || lat === null || lng === null || !tz)
      errs.city = 'Please select a city from the search results.';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = encodeBirthData({
        name: name.trim(),
        date,
        time: unknownTime || !time ? null : time,
        lat: lat!,
        lng: lng!,
        tz,
        city,
      });
      router.push('/result?data=' + token);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-white/5 backdrop-blur-sm border border-purple-800/50 rounded-2xl p-6 sm:p-8 space-y-6"
    >
      <div className="space-y-1.5">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-purple-200"
        >
          Your name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          required
          autoComplete="given-name"
          placeholder="e.g. Alex"
          aria-describedby={errors.name ? 'name-error' : undefined}
          aria-invalid={!!errors.name}
          className="w-full bg-slate-900 border border-purple-700 text-purple-100 placeholder-purple-400/60 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        />
        {errors.name && (
          <p id="name-error" className="text-xs text-red-400" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="date"
          className="block text-sm font-medium text-purple-200"
        >
          Birth date
        </label>
        <input
          id="date"
          type="date"
          value={date}
          max={today}
          onChange={(e) => {
            setDate(e.target.value);
            setErrors((prev) => ({ ...prev, date: undefined }));
          }}
          required
          aria-describedby={errors.date ? 'date-error' : undefined}
          aria-invalid={!!errors.date}
          className="w-full bg-slate-900 border border-purple-700 text-purple-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent [color-scheme:dark]"
        />
        {errors.date && (
          <p id="date-error" className="text-xs text-red-400" role="alert">
            {errors.date}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="time"
          className="block text-sm font-medium text-purple-200"
        >
          Birth time{' '}
          <span className="text-purple-400 font-normal">(optional)</span>
        </label>
        <input
          id="time"
          type="time"
          value={time}
          disabled={unknownTime}
          onChange={(e) => setTime(e.target.value)}
          aria-label="Birth time"
          className="w-full bg-slate-900 border border-purple-700 text-purple-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent [color-scheme:dark] disabled:opacity-40 disabled:cursor-not-allowed"
        />
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={unknownTime}
            onChange={(e) => {
              setUnknownTime(e.target.checked);
              if (e.target.checked) setTime('');
            }}
            className="w-4 h-4 rounded accent-amber-400"
          />
          <span className="text-sm text-purple-300">
            I don&apos;t know my birth time
          </span>
        </label>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-purple-200">
          Birth city
        </label>
        <CitySearch onSelect={handleCitySelect} />
        {errors.city && (
          <p className="text-xs text-red-400" role="alert">
            {errors.city}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 font-semibold rounded-xl py-3 px-6 text-base transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
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
            Generating…
          </span>
        ) : (
          'Generate My Calendar ✨'
        )}
      </button>
    </form>
  );
}
