'use client';

import { useState } from 'react';
import { track } from '@vercel/analytics';

interface SubscribeUrlProps {
  subscribeUrl: string;
  name: string;
}

const steps = [
  'Open Google Calendar on desktop',
  'Click "+" next to "Other calendars" in the left sidebar',
  'Select "From URL"',
  'Paste the URL and click "Add Calendar"',
];

export default function SubscribeUrl({ subscribeUrl, name }: SubscribeUrlProps) {
  const [copied, setCopied] = useState(false);

  const webcalUrl = subscribeUrl.replace(/^https?:\/\//, 'webcal://');
  const googleCalUrl = `https://www.google.com/calendar/render?cid=${encodeURIComponent(webcalUrl)}`;

  const handleCopy = async () => {
    track('copy_url');
    try {
      await navigator.clipboard.writeText(subscribeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.getElementById('subscribe-url') as HTMLInputElement | null;
      input?.select();
    }
  };

  return (
    <div className="space-y-6">
      {/* Subscribe buttons */}
      <div className="border border-foreground/15 p-4 space-y-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/40">Add to calendar</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <a
            href={webcalUrl}
            onClick={() => track('webcal_click', { client: 'apple' })}
            className="flex-1 bg-background border border-foreground text-foreground text-xs uppercase tracking-[0.15em] px-4 py-2.5 text-center hover:bg-foreground hover:text-background transition-colors focus:outline-none focus:ring-1 focus:ring-foreground focus:ring-offset-1 focus:ring-offset-background"
          >
            Apple Calendar
          </a>
          <a
            href={googleCalUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('webcal_click', { client: 'google' })}
            className="flex-1 bg-background border border-foreground text-foreground text-xs uppercase tracking-[0.15em] px-4 py-2.5 text-center hover:bg-foreground hover:text-background transition-colors focus:outline-none focus:ring-1 focus:ring-foreground focus:ring-offset-1 focus:ring-offset-background"
          >
            Google Calendar
          </a>
        </div>
      </div>

      {/* URL block */}
      <div className="border border-foreground/15 p-4 space-y-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/30">
          {name} · personal transit calendar
        </p>

        <div className="flex gap-2">
          <input
            id="subscribe-url" type="text" readOnly value={subscribeUrl}
            aria-label="Subscribe URL"
            className="flex-1 min-w-0 bg-background border border-foreground/20 text-foreground/60 text-xs px-3 py-2 focus:outline-none focus:border-foreground/50"
          />
          <button
            onClick={handleCopy}
            aria-label={copied ? 'Copied' : 'Copy URL'}
            className="shrink-0 bg-foreground text-background text-xs uppercase tracking-[0.15em] px-4 py-2 hover:bg-foreground/90 transition-colors focus:outline-none focus:ring-1 focus:ring-foreground focus:ring-offset-1 focus:ring-offset-background"
          >
            {copied ? '✓' : 'Copy'}
          </button>
        </div>

        <p className="text-[10px] text-foreground/20 uppercase tracking-widest">
          Or copy URL for Outlook and other iCal apps
        </p>
      </div>

      {/* Instructions */}
      <div className="border border-foreground/10 p-4 space-y-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/40">Manual setup · Google Calendar</p>
        <ol className="space-y-2.5">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-xs text-foreground/50">
              <span className="shrink-0 text-[10px] text-foreground/25 mt-px tabular-nums">{i + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
        <p className="text-[10px] text-foreground/20 pt-2 border-t border-foreground/8 uppercase tracking-widest">
          Also works with Apple Calendar, Outlook, and any iCal app
        </p>
      </div>
    </div>
  );
}
