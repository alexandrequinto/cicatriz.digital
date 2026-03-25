# cicatriz.digital — Backlog

## In Progress

## To Do

### Content *(plan first)*

### Growth *(plan first)*
- [ ] **Support / additional languages** — es, nl, and others. Same pattern as pt-BR: extend generate script, add messages file. `[Growth]`
- [ ] **Support / Buy Me a Coffee** — Community project. Needs design thinking: placement, copy tone, platform choice (Ko-fi, GitHub Sponsors, BMC). Should feel optional and aligned with the no-monetization ethos. `[Community]`

## Done

- [x] **System-aware light/dark mode** — `prefers-color-scheme` flips CSS custom properties (`--background`/`--foreground`). All components use semantic tokens (`bg-background`, `text-foreground`, opacity variants). Native date/time pickers inherit `color-scheme` from `:root`. No hardcoded colors anywhere.
- [x] **Per-category iCal event colors** — `COLOR` (RFC 7986) and `X-APPLE-CALENDAR-COLOR` per category. Category type label prepended to all event descriptions.
- [x] **Two-line city search results** — Dropdown shows city name on line 1, state + country on line 2 (muted). Uses Nominatim `addressdetails` fields.
- [x] **ARIA describedby on form errors** — All three fields (`name`, `date`, `city`) link inputs to error messages via `aria-describedby` + `role="alert"`. WCAG 2.1 AA.
- [x] **Inline birth time warning** — "☽ Moon transits will use solar noon as an approximation." shown inline when Unknown is checked.
- [x] **Homepage product description** — 1–2 line description below slogan. Plain-language privacy note in footer explaining stateless model.
- [x] **OG image refresh** — Third tagline line added ("Planetary transits · Lunar phases · Retrograde stations"), layout polished.
- [x] **Mobile date/time viewport fix** — `min-w-0` on grid children + `overflow-hidden` on container prevents native input intrinsic widths from breaking the viewport.
- [x] **Transit events as single-day markers** — Each transit emits two all-day events ("begins" on ingress, "exact" on peak) instead of a multi-day spanning block.
- [x] **Retrograde periods as multi-day calendar spans** — Retrograde station events span from Rx date to direct date. Direct station is a 1-hour point event.
- [x] **webcal:// deep-link subscribe buttons** — "Add to Apple Calendar" (webcal://) and "Add to Google Calendar" buttons on result page.
- [x] **Event preview on result page** — Next 5 upcoming events computed server-side, shown below confirmation card.
- [x] **Birth data confirmation card** — Name, date, time, city shown on result page with edit link.
- [x] **Funnel event tracking** — `track('form_submit')`, `track('copy_url')`, `track('webcal_click', {client})`.
- [x] **Eclipse events** — Solar (total/annular/partial) and lunar (total/partial/penumbral) via astronomy-engine. Filter bit 32, dark magenta calendar color, 6 interpretations generated.
- [x] **Moon ingress × lunar phase** — Moon ingress events show current phase in title (e.g. "Moon ☽ enters Leo · Waxing Gibbous"). 96 phase-specific interpretations generated (12 signs × 8 phases).
- [x] **Transit interpretation copy** — 405-entry `lib/transitInterpretations.json`. Injected in all transit generators. Zero runtime cost.
- [x] **Per-category event filtering** — 5-bit bitmask (`f` field in token). Five filter checkboxes. Backward-compatible.
- [x] **B&W redesign** — Pure black/white Geist Mono industrial palette. "Cicatriz" + "Marked by the cosmos" slogan.
- [x] **Metadata & OG image (Cicatriz brand)** — Full SEO/OG/Twitter metadata, `opengraph-image.tsx`, JSON-LD schema.
- [x] **HMAC-SHA256 token signing** — `lib/tokenSigning.ts` (server-only). Fixes React hydration error #418.
- [x] **Remove all storage** — Blob cache and in-memory rate limiter deleted. Pure stateless compute.
- [x] **Stable iCal event UIDs** — Deterministic UIDs via SHA-1 hash prevent duplicate calendar entries on refresh.
- [x] **Validate decoded birth data fields** — Date, lat/lng, time format, timezone validated before computation.
- [x] **Internal timeout guard** — 20s `Promise.race` deadline; returns 503 on timeout.
- [x] **Structured logging** — `requestId`, event counts, per-phase durations logged as JSON to Vercel.
- [x] **Server-side AES-256-GCM encryption** — Birth data never in URLs as readable PII. Client POSTs to `/api/encode`; server returns opaque `enc.<base64url>` token. Legacy HMAC tokens accepted as fallback (existing subscriptions unbroken). Stable iCal UIDs derived from birth data fields, not token string. 47 tests.
- [x] **Privacy page** — `/privacy` with EN + pt-BR content covering data handling, encryption, third-party services. Linked from footer alongside FAQ and Feedback.
- [x] **Feedback mailto link** — `feedback@cicatriz.digital` in footer next to FAQ link.
- [x] **pt-BR localization** — next-intl routing, 120 UI strings in EN + pt-BR, locale token in iCal feed, localized event titles, 407 native pt-BR interpretations generated. Locale switcher with flags in hero.
- [x] **FAQ page** — `/faq` with 14 questions across 4 sections: How it works, Your data & privacy, Event descriptions, Calendar subscription. Linked from footer.
- [x] **Test suite with Vitest** — 47 tests across birthData, tokenSigning, ingresses, ephemeris, encryption.
- [x] **Vercel Analytics** — `<Analytics />` in root layout.
- [x] **Core app** — Next.js App Router, `astronomy-engine`, `ical-generator`, stateless base64url token, city autocomplete via Nominatim.
