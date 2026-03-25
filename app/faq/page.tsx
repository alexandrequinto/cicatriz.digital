import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'How Cicatriz works, what happens to your data, and how to get the most out of your astrology calendar.',
};

interface QAProps {
  q: string;
  children: React.ReactNode;
}

function QA({ q, children }: QAProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/40">{q}</p>
      <div className="text-xs text-foreground/65 leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5">
      <p className="text-[10px] uppercase tracking-[0.25em] text-foreground/25 border-b border-foreground/8 pb-2">{title}</p>
      {children}
    </section>
  );
}

export default function FaqPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 w-full max-w-sm mx-auto px-5 pt-12 pb-10 space-y-10">

        <div className="space-y-1">
          <Link href="/" className="text-[10px] uppercase tracking-[0.2em] text-foreground/25 hover:text-foreground/60 transition-colors">
            ← Cicatriz
          </Link>
          <h1 className="text-xs uppercase tracking-[0.25em] text-foreground/50 pt-2">
            Frequently asked questions
          </h1>
        </div>

        <Section title="How it works">
          <QA q="What does Cicatriz do?">
            <p>
              You enter your birth details once. Cicatriz computes your natal chart — the positions of the Sun, Moon, and planets at the moment of your birth — then calculates when transiting planets will form significant aspects to those positions over the next 12 months. The result is a standard iCal calendar you can subscribe to in any calendar app.
            </p>
          </QA>
          <QA q="How far ahead does the calendar look?">
            <p>12 months from the date of each request. Because the calendar is recomputed on every fetch, it stays current automatically.</p>
          </QA>
          <QA q="What calendar apps are supported?">
            <p>
              Any app that supports iCal URL subscriptions: Apple Calendar, Google Calendar, Outlook, Fantastical, and most others. On mobile, Apple Calendar supports one-tap subscription via the webcal:// link. Google Calendar on mobile does not support URL subscriptions — use a desktop browser for Google Calendar.
            </p>
          </QA>
          <QA q="What are the five event categories?">
            <p><span className="text-foreground/40 uppercase tracking-widest text-[9px]">Outer planet transits</span> — Jupiter, Saturn, Uranus, Neptune, and Pluto forming conjunctions, squares, trines, and oppositions to your natal planets. These are slow-moving and tend to mark significant periods.</p>
            <p><span className="text-foreground/40 uppercase tracking-widest text-[9px]">Personal transits</span> — Sun, Mercury, Venus, and Mars aspecting your natal chart. These repeat frequently and mark shorter cycles.</p>
            <p><span className="text-foreground/40 uppercase tracking-widest text-[9px]">Lunar phases</span> — New Moon, Full Moon, First Quarter, Last Quarter.</p>
            <p><span className="text-foreground/40 uppercase tracking-widest text-[9px]">Sign ingresses</span> — Planets entering a new zodiac sign.</p>
            <p><span className="text-foreground/40 uppercase tracking-widest text-[9px]">Retrograde stations</span> — Planets stationing retrograde and direct, shown as a spanning period.</p>
          </QA>
          <QA q="What do the filters do?">
            <p>
              The five checkboxes on the form control which event categories appear in your calendar. Your choices are encoded in the subscribe URL — the calendar only includes what you selected. To change your filters, generate a new calendar and replace the subscription URL in your app.
            </p>
          </QA>
          <QA q="Why do transit events show as two entries?">
            <p>
              Each transit appears twice: a <em>begins</em> event on the day it enters orb, and an <em>exact</em> event on the day the aspect peaks. This replaces what used to be a long multi-day block in the calendar view.
            </p>
          </QA>
        </Section>

        <Section title="Your data & privacy">
          <QA q="What do you do with my birth data?">
            <p>
              Nothing. Your birth data is encoded directly into the subscribe URL — it never touches a database, a log file, or any storage on our side. Every time your calendar app fetches the calendar, the data is decoded from the URL, the calendar is computed fresh, and everything is discarded. There is no server state.
            </p>
          </QA>
          <QA q="Who can see my subscribe URL?">
            <p>
              Anyone you share it with. The URL encodes your name, birth date, time, and location. Treat it like any personal document — don&apos;t share it publicly if you&apos;d prefer to keep that information private.
            </p>
          </QA>
          <QA q="Can I delete my data?">
            <p>
              Yes. Remove the calendar subscription from your app and discard the result page URL. Since nothing is stored on our end, there is nothing to request deletion of — it&apos;s gone when the URL is gone.
            </p>
          </QA>
          <QA q="Is my birth time required?">
            <p>
              No. If you don&apos;t know your birth time, check the Unknown box. Moon transits will be estimated using solar noon at your birth location — they&apos;ll appear in the calendar but their timing is approximate.
            </p>
          </QA>
        </Section>

        <Section title="Event descriptions">
          <QA q="Are the event descriptions personalized?">
            <p>
              The <em>events</em> are personalized — which transits appear and when depends entirely on your natal chart. The <em>descriptions</em> are not. Each transit type (e.g. Saturn square natal Venus) has a fixed interpretation written in advance. The same text appears for everyone with that transit active.
            </p>
          </QA>
          <QA q="How were the descriptions written?">
            <p>
              They were written as a static set of 278 interpretations, one per planet-aspect-planet combination. No AI generates text at request time — the interpretations are embedded in the app and served instantly at zero cost.
            </p>
          </QA>
          <QA q="How should I read the event descriptions?">
            <p>
              Each description names the transit type (e.g. Outer Planet Transit), the mechanic (which planet, which aspect, which natal point, and when it peaks), and an interpretive note for context. The interpretation is a starting point — not a prediction. Use it as a lens, not a verdict.
            </p>
          </QA>
        </Section>

        <Section title="Calendar subscription">
          <QA q="How does the live subscription work?">
            <p>
              The subscribe URL is a live endpoint. When you add it to your calendar app, the app periodically fetches it and updates its local copy. Each fetch recomputes the calendar from the birth data encoded in the URL — no caching, no stored state on our side.
            </p>
          </QA>
          <QA q="How do I update my details or filters?">
            <p>
              Generate a new calendar with the updated data and replace the subscription URL in your calendar app. Your old calendar will stop updating once you remove it.
            </p>
          </QA>
          <QA q="Why doesn't the calendar update instantly?">
            <p>
              Calendar apps control their own refresh schedule. Google Calendar typically syncs once every 24 hours regardless of what the server advertises. Apple Calendar is more responsive and usually syncs within a few hours.
            </p>
          </QA>
        </Section>

      </main>

      <footer className="px-5 py-5 border-t border-foreground/8">
        <p className="text-[10px] text-foreground/20 uppercase tracking-widest text-center">
          No account · No storage · Your data lives only in your URL
        </p>
      </footer>
    </div>
  );
}
