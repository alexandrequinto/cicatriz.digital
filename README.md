# Cicatriz

**Your natal chart, delivered to your calendar.**

Cicatriz generates a live iCal feed of personalized astrological events based on your birth data — planetary transits, lunar phases, sign ingresses, retrograde stations, and eclipses. Subscribe once in Google Calendar, Apple Calendar, or any iCal-compatible app and it stays current automatically.

**[cicatriz.digital](https://cicatriz.digital)** · GPL v3 · No account · No storage

---

## What it does

- Computes outer and inner planet transits to your natal chart positions
- Tracks lunar phases (New Moon, First Quarter, Full Moon, Last Quarter)
- Tracks sign ingresses and retrograde stations for Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn
- Includes solar and lunar eclipses
- Generates an `.ics` feed you subscribe to — your calendar app fetches it on its own schedule
- Each event includes a short interpretation text (405+ entries, written natively in EN and pt-BR)

## How it works

1. User enters name, birth date, time, and city
2. Browser POSTs to `/api/encode` — birth data is AES-256-GCM encrypted server-side and returned as an opaque token
3. Token is embedded in a subscribe URL: `/api/ical?data=<token>`
4. On each calendar fetch, the token is decrypted in memory, events are computed, and the `.ics` response is returned — nothing is written to disk or stored between requests

Birth data never appears in URLs in readable form. There is no database, no user accounts, and no server state.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| Ephemeris | [astronomy-engine](https://github.com/cosinekitty/astronomy) |
| iCal | [ical-generator](https://github.com/sebbo2002/ical-generator) |
| i18n | next-intl (EN, pt-BR) |
| City search | Nominatim / OpenStreetMap |
| Analytics | Vercel Analytics |
| Tests | Vitest (47 tests) |
| Deploy | Vercel |

## Running locally

```bash
npm install
```

Create a `.env.local` file:

```env
ENCRYPTION_KEY=<32-byte hex string>   # openssl rand -hex 32
TOKEN_SECRET=<random string>           # legacy HMAC fallback, can be any string locally
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Generating interpretation content

Transit interpretation copy lives in `lib/transitInterpretations.json` (English) and `lib/transitInterpretations.pt-BR.json`. To regenerate or extend:

```bash
# English
ANTHROPIC_API_KEY=<key> npm run generate:interpretations

# Other locale (writes lib/transitInterpretations.<locale>.json)
ANTHROPIC_API_KEY=<key> npm run generate:interpretations -- --locale pt-BR
```

The script is idempotent — it only generates missing keys and merges into the existing file.

## Adding a new locale

1. Add the locale code to `i18n/routing.ts`
2. Create `messages/<locale>.json` (copy `messages/en.json` and translate)
3. Run the generate script with `--locale <locale>`
4. Add a flag entry to `components/LocaleSwitcher.tsx`

## Project structure

```
app/
  [locale]/         # All pages (home, result, faq, privacy)
  api/
    ical/           # iCal feed generator
    encode/         # Birth data encryption endpoint
    timezone/       # Timezone lookup
components/         # NatalChartForm, CitySearch, SubscribeUrl, Footer, LocaleSwitcher
lib/
  transits.ts       # Outer planet transits
  personalTransits.ts
  ingresses.ts      # Sign ingresses + retrograde stations
  lunarPhases.ts
  eclipses.ts
  calendarBuilder.ts
  birthData.ts      # Token encode/decode
  encryption.ts     # AES-256-GCM
  i18n/
    calendarStrings.ts  # Localized event strings
messages/           # UI translations (en, pt-BR)
scripts/
  generateInterpretations.ts
tests/
```

## License

[GNU General Public License v3.0](LICENSE)
