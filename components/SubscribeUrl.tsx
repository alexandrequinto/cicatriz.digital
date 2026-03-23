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
  'Paste your subscribe URL and click "Add Calendar"',
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
    <div className="space-y-4">
      <div className="border border-stone-800 rounded-xl p-4 space-y-3">
        <div>
          <p className="text-xs text-stone-500">{name} · personal transit calendar</p>
        </div>

        <div className="flex gap-2">
          <input
            id="subscribe-url" type="text" readOnly value={subscribeUrl}
            aria-label="Subscribe URL"
            className="flex-1 min-w-0 bg-stone-900 border border-stone-700 text-stone-300 font-mono text-xs rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <button
            onClick={handleCopy}
            aria-label={copied ? 'Copied' : 'Copy URL'}
            className="shrink-0 bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold rounded-md px-3 py-2 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-stone-950"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>

        <p className="text-xs text-stone-600">Google Calendar checks for updates periodically.</p>
      </div>

      <div className="border border-stone-800 rounded-xl p-4 space-y-3">
        <p className="text-xs font-medium text-stone-300">Add to Google Calendar</p>
        <ol className="space-y-2">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs text-stone-400">
              <span className="shrink-0 w-4 h-4 flex items-center justify-center rounded-full border border-stone-700 text-stone-500 text-[10px] mt-px">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
        <p className="text-xs text-stone-600 pt-1 border-t border-stone-800">
          Also works with Apple Calendar, Outlook, and any iCal-compatible app.
        </p>
      </div>
    </div>
  );
}
