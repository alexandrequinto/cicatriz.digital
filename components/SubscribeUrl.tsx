'use client';

import { useState } from 'react';

interface SubscribeUrlProps {
  subscribeUrl: string;
  name: string;
}

const steps = [
  'Open Google Calendar on desktop',
  'Click the "+" next to "Other calendars" in the left sidebar',
  'Select "From URL"',
  'Paste your subscribe URL',
  'Click "Add Calendar" — done!',
];

export default function SubscribeUrl({ subscribeUrl, name }: SubscribeUrlProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(subscribeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text
      const input = document.getElementById('subscribe-url') as HTMLInputElement | null;
      input?.select();
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white/5 backdrop-blur-sm border border-purple-800/50 rounded-2xl p-6 sm:p-8 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-amber-400 mb-1">
            {name}&apos;s Astrology Calendar
          </h2>
          <p className="text-sm text-purple-300">
            Your personal iCal subscribe URL
          </p>
        </div>

        <div className="flex gap-2">
          <input
            id="subscribe-url"
            type="text"
            readOnly
            value={subscribeUrl}
            aria-label="Subscribe URL"
            className="flex-1 bg-slate-900 border border-purple-700 text-purple-100 font-mono text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent overflow-ellipsis"
          />
          <button
            onClick={handleCopy}
            aria-label={copied ? 'URL copied' : 'Copy subscribe URL'}
            className="shrink-0 flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 font-semibold rounded-lg px-4 py-2.5 text-sm transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            {copied ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                    clipRule="evenodd"
                  />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                  aria-hidden="true"
                >
                  <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
                  <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z" />
                </svg>
                Copy URL
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-purple-400">
          Your calendar refreshes every 6 hours with upcoming transits.
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-sm border border-purple-800/50 rounded-2xl p-6 sm:p-8 space-y-5">
        <h3 className="text-base font-semibold text-purple-100">
          Add to Google Calendar
        </h3>
        <ol className="space-y-3">
          {steps.map((step, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold mt-0.5">
                {index + 1}
              </span>
              <span className="text-sm text-purple-200 leading-relaxed">
                {step}
              </span>
            </li>
          ))}
        </ol>
        <p className="text-xs text-purple-400 pt-1 border-t border-purple-800/50">
          Works with Apple Calendar, Outlook, and any app that supports iCal subscriptions.
        </p>
      </div>
    </div>
  );
}
