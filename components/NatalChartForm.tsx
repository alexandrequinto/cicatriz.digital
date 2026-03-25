'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { track } from '@vercel/analytics';
import CitySearch from '@/components/CitySearch';
import { FILTER_BITS, ALL_FILTERS } from '@/lib/birthData';

interface FormErrors {
  name?: string;
  date?: string;
  city?: string;
}

const fieldLabel = 'block text-[10px] uppercase tracking-[0.2em] text-foreground/40 mb-1.5';
const fieldInput = 'w-full bg-background border border-foreground/20 text-foreground text-sm px-3 py-2 focus:outline-none focus:border-foreground/70 transition-colors placeholder:text-foreground/20';

export default function NatalChartForm() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('form');

  const FILTER_OPTIONS = [
    { bit: FILTER_BITS['outer-transit'], label: t('filterOuterLabel'),     hint: t('filterOuterHint') },
    { bit: FILTER_BITS['inner-transit'], label: t('filterInnerLabel'),     hint: t('filterInnerHint') },
    { bit: FILTER_BITS['lunar'],         label: t('filterLunarLabel'),     hint: t('filterLunarHint') },
    { bit: FILTER_BITS['ingress'],       label: t('filterIngressLabel'),   hint: t('filterIngressHint') },
    { bit: FILTER_BITS['retrograde'],    label: t('filterRetrogradeLabel'), hint: '' },
    { bit: FILTER_BITS['eclipse'],       label: t('filterEclipseLabel'),   hint: t('filterEclipseHint') },
  ];

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
  const [submitError, setSubmitError] = useState<string | null>(null);
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
    if (!name.trim()) errs.name = t('nameRequired');
    if (!date) errs.date = t('birthDateRequired');
    if (!city || lat === null || lng === null || !tz) errs.city = t('cityRequired');
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/encode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(), date,
          time: unknownTime || !time ? null : time,
          lat, lng, tz, city, filters, locale,
        }),
      });
      if (!res.ok) {
        setSubmitError(t('submitError'));
        setIsSubmitting(false);
        return;
      }
      const { token } = await res.json();
      track('form_submit');
      router.push('/result?data=' + token);
    } catch {
      setSubmitError(t('networkError'));
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className={fieldLabel}>{t('name')}</label>
        <input
          id="name" type="text" value={name}
          onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
          required autoComplete="given-name" placeholder={t('namePlaceholder')}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
          className={fieldInput}
        />
        {errors.name && <p id="name-error" role="alert" className="mt-1 text-[10px] text-foreground/50">{errors.name}</p>}
      </div>

      {/* Date + Time — stack on mobile, side-by-side on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-hidden">
        <div className="min-w-0">
          <label htmlFor="date" className={fieldLabel}>{t('birthDate')}</label>
          <input
            id="date" type="date" value={date} max={today}
            onChange={(e) => { setDate(e.target.value); setErrors((p) => ({ ...p, date: undefined })); }}
            required aria-invalid={!!errors.date}
            aria-describedby={errors.date ? 'date-error' : undefined}
            className={fieldInput + ' '}
          />
          {errors.date && <p id="date-error" role="alert" className="mt-1 text-[10px] text-foreground/50">{errors.date}</p>}
        </div>

        <div className="min-w-0">
          <label htmlFor="time" className={fieldLabel}>
            {t('birthTime')}
          </label>
          <input
            id="time" type="time" value={time} disabled={unknownTime}
            onChange={(e) => setTime(e.target.value)}
            className={fieldInput + '  disabled:opacity-25 disabled:cursor-not-allowed'}
          />
          <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
            <input
              type="checkbox" checked={unknownTime}
              onChange={(e) => { setUnknownTime(e.target.checked); if (e.target.checked) setTime(''); }}
              className="w-3 h-3 accent-foreground"
            />
            <span className="text-[10px] uppercase tracking-[0.15em] text-foreground/30">{t('birthTimeUnknown')}</span>
          </label>
          {unknownTime && (
            <p className="text-[10px] text-foreground/30 uppercase tracking-[0.12em] mt-2 leading-relaxed">
              {t('moonWarning')}
            </p>
          )}
        </div>
      </div>

      {/* City */}
      <div>
        <label className={fieldLabel}>{t('birthCity')}</label>
        <CitySearch onSelect={handleCitySelect} />
        {errors.city && <p id="city-error" role="alert" className="mt-1 text-[10px] text-foreground/50">{errors.city}</p>}
      </div>

      {/* Divider */}
      <div className="border-t border-foreground/8" />

      {/* Filters */}
      <div>
        <p className={fieldLabel}>{t('include')}</p>
        <div className="space-y-3 mt-2">
          {FILTER_OPTIONS.map(({ bit, label, hint }) => {
            const checked = (filters & bit) !== 0;
            return (
              <label key={bit} className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => setFilters(checked ? filters & ~bit : filters | bit)}
                  className="mt-px w-3 h-3 accent-foreground shrink-0"
                />
                <span className="text-xs text-foreground/70 leading-snug">
                  {label}
                  {hint && <span className="text-foreground/25 ml-2 text-[10px]">{hint}</span>}
                </span>
              </label>
            );
          })}
        </div>
        {filters === 0 && (
          <p className="mt-3 text-[10px] text-foreground/40 uppercase tracking-widest">
            {t('noTypes')}
          </p>
        )}
      </div>

      {submitError && (
        <p role="alert" className="text-[10px] text-foreground/50 uppercase tracking-widest">{submitError}</p>
      )}

      <button
        type="submit" disabled={isSubmitting}
        className="w-full bg-foreground text-background text-xs uppercase tracking-[0.2em] py-3 hover:bg-foreground/90 transition-colors focus:outline-none focus:ring-1 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isSubmitting ? t('submitting') : t('submit')}
      </button>
    </form>
  );
}
