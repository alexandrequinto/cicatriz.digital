'use client';

import { useState } from 'react';

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

  const handleCopy = async () => {
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
      {/* URL block */}
      <div className="border border-white/15 p-4 space-y-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
          {name} · personal transit calendar
        </p>

        <div className="flex gap-2">
          <input
            id="subscribe-url" type="text" readOnly value={subscribeUrl}
            aria-label="Subscribe URL"
            className="flex-1 min-w-0 bg-black border border-white/20 text-white/60 text-xs px-3 py-2 focus:outline-none focus:border-white/50"
          />
          <button
            onClick={handleCopy}
            aria-label={copied ? 'Copied' : 'Copy URL'}
            className="shrink-0 bg-white text-black text-xs uppercase tracking-[0.15em] px-4 py-2 hover:bg-white/90 transition-colors focus:outline-none focus:ring-1 focus:ring-white focus:ring-offset-1 focus:ring-offset-black"
          >
            {copied ? '✓' : 'Copy'}
          </button>
        </div>

        <p className="text-[10px] text-white/20 uppercase tracking-widest">
          Google Calendar checks for updates periodically
        </p>
      </div>

      {/* Instructions */}
      <div className="border border-white/10 p-4 space-y-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Add to Google Calendar</p>
        <ol className="space-y-2.5">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-xs text-white/50">
              <span className="shrink-0 text-[10px] text-white/25 mt-px tabular-nums">{i + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
        <p className="text-[10px] text-white/20 pt-2 border-t border-white/8 uppercase tracking-widest">
          Also works with Apple Calendar, Outlook, and any iCal app
        </p>
      </div>
    </div>
  );
}
