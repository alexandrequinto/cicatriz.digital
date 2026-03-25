# cicatriz.digital — Backlog

## In Progress

## To Do

### Bugs
- [ ] **Mobile date/time field overflow** — Native `<input type="date/time">` intrinsic widths break viewport on mobile. Fix: `min-w-0` on grid children + `overflow-hidden` on container. `[Bug · Mobile]` ✓ fixed, pending QA

### UX
- [ ] **Better city search result display** — Raw truncated `display_name` is ambiguous for common city names (e.g. "São Bernardo do Campo - SP" returns duplicates). Show two lines: city name + country/state in muted text below. `[UX]`
- [ ] **Light/dark mode per system preference** — Current palette is pure black. Respect `prefers-color-scheme` to lighten the palette on light-mode devices, or introduce a proper light theme. `[UX]`
- [ ] **ARIA describedby on form error messages** — Error `<p>` elements have no `id` and are not linked via `aria-describedby`. Screen readers announce invalid fields but don't read the reason. WCAG 2.1 AA failure. `[Accessibility · Must]`
- [ ] **Inline birth time warning** — Surface "Moon transits estimated" as inline help text next to the time field rather than only showing on the result page. `[UX]`

### Features
- [ ] **Per-category iCal event colors** — Add `COLOR` (RFC 7986) and `X-APPLE-CALENDAR-COLOR` per category (outer transits: indigo, inner transits: blue, lunar: silver, ingress: green, retrograde: red). Also prepend event type label to description so users know what kind of event it is. `[Feature]`
- [ ] **Updated OG / social image** — Refresh look and feel to match current B&W Cicatriz design. No personal data — static brand image only. `[Design]`
- [ ] **Homepage product description** — Add 1–2 lines below the "Marked by the cosmos" slogan explaining what the product does. Keep it minimal. `[Copy]`

### Trust & Privacy
- [ ] **Trust signals and privacy explainer** — "No account. No storage." is in the footer but undersells the model. Add a plain-language section explaining the stateless token architecture — your birth data never leaves your URL, nothing is stored server-side. Critical because this is PII. `[Trust · Must]`

### Content
- [ ] **FAQ page** — How the product works, privacy model, how to interpret events, how to use filters, how calendar subscription works. Covers the post-subscribe dead-end and drives organic search. `[Content · SEO]`
- [ ] **HowTo and FAQ structured data** — `HowTo` schema on result page subscribe steps; `FAQPage` schema on /faq. `[SEO]`
- [ ] **/transit/:slug content pages** — "mercury retrograde 2026 dates," "saturn square natal sun meaning" — static content layer per transit type. `[SEO]`

### Growth
- [ ] **Spanish and Portuguese localization** — "Cicatriz" is Spanish/Portuguese. High astrology engagement in Brazil, Mexico, Argentina, Spain. Needs careful planning: copy, date formats, city search locale. `[Growth · Plan first]`
- [ ] **Send feedback** — Lightweight feedback mechanism. Needs design thinking: what channel (email, form, GitHub issues?), how to keep it stateless/private, when to surface it. `[Growth · Plan first]`
- [ ] **Support / Buy Me a Coffee** — Community project. Needs design thinking: placement, copy tone, platform choice (Ko-fi, GitHub Sponsors, BMC). Should feel optional and aligned with the no-monetization ethos. `[Community · Plan first]`

## Done

- [x] **Transit events as single-day markers** — Each transit emits two all-day events ("begins" on ingress, "exact" on peak) instead of a multi-day spanning block. Both outer and inner transits affected.
- [x] **Retrograde periods as multi-day calendar spans** — Retrograde station events now span from Rx date to direct date. Direct station remains a 1-hour point event. Window-end flush and orphaned direct station handled. 8 new tests.
- [x] **webcal:// deep-link subscribe buttons** — "Add to Apple Calendar" (webcal://) and "Add to Google Calendar" (google.com/calendar/render?cid=) buttons added to result page above the copy input.
- [x] **Event preview on result page** — Next 5 upcoming events computed server-side (3-month window), shown below confirmation card. Respects filters bitmask. Non-fatal try/catch.
- [x] **Birth data confirmation card** — Shows name, date, time, city from token on result page. Includes edit link back to home.
- [x] **Funnel event tracking** — `track('form_submit')` on form submit, `track('copy_url')` on copy, `track('webcal_click', {client})` on subscribe button clicks.

- [x] **Transit interpretation copy** — 278-entry `lib/transitInterpretations.json` pre-generated via Claude Haiku (~$0.02). `lib/interpretations.ts` exports `getInterpretation(key)`. Injected at all push sites in `transits.ts`, `personalTransits.ts`, `ingresses.ts`, `lunarPhases.ts`. Zero runtime cost.
- [x] **Per-category event filtering** — 5-bit bitmask (`f` field in token). Five filter checkboxes in `NatalChartForm` (outer transits, inner transits, lunar phases, ingresses, retrogrades). Backward-compatible: absent field = all enabled. `/api/ical` validates 0–31 range.
- [x] **B&W redesign** — Pure black (#000) / white Geist Mono industrial minimalist palette. "Cicatriz" title with "Marked by the cosmos" slogan. Astrological symbols as decorative elements.
- [x] **Metadata & OG image (Cicatriz brand)** — `layout.tsx` full SEO/OG/Twitter metadata. `opengraph-image.tsx` pure black 1200×630 with Cicatriz branding. JSON-LD WebApplication schema updated.
- [x] **Mobile field overlap fix** — `grid-cols-1 sm:grid-cols-2` date/time row in `NatalChartForm`.
- [x] **Hero symbol sizing fix** — Each symbol rendered as individual `<span>` at `text-xl text-white/20` in a flex row for consistent sizing.
- [x] **Stable iCal event UIDs** — `calendarBuilder` now generates deterministic UIDs via SHA-1 hash of `tokenHash|title|date`, preventing duplicate calendar entries on refresh.
- [x] **Drop open-ended personal transit at window edge** — `getPersonalTransits` now flushes any open transit window after the scan loop ends, matching the `getOuterTransits` pattern.
- [x] **False retrograde events at sign boundaries** — `getIngressAndRetrogradeEvents` now uses `skipNextRetrogradeCheck` flag after detecting a sign ingress, eliminating spurious retrograde/direct stations at 30° boundaries.
- [x] **City search state desync on timezone failure** — `CitySearch` stores `previousQuery` before overwriting; restores it on timezone lookup failure so the form shows the correct error.
- [x] **Fix robots.txt sitemap URL** — Points to `https://cicatriz.digital/sitemap.xml`.
- [x] **Correct "refreshes every 6 hours" copy** — Changed to "Google Calendar checks for updates periodically."
- [x] **Branding cleanup** — `package.json` name is `cicatriz-digital`; `calendarBuilder` prodId uses `cicatriz.digital`.
- [x] **Memoize planet longitude calls** — Module-level `lonCache` Map in `ephemeris.ts` keyed on `planet:hourKey` eliminates redundant VSOP87 calls within a request.
- [x] **Validate decoded birth data fields** — `/api/ical` validates date format, lat/lng ranges, time format, and timezone string before running any computation.
- [x] **HMAC-SHA256 token signing** — `lib/tokenSigning.ts` (server-only) signs tokens with `HMAC_SECRET`. Result page re-signs unsigned client tokens. Legacy unsigned tokens accepted with warning. Fixes React hydration error #418 caused by crypto in client bundle.
- [x] **Remove all storage** — Deleted Vercel Blob cache (`lib/blobCache.ts`) and in-memory IP rate limiter. Pure stateless compute: request in, ICS out, nothing persisted. Consistent with "Your data lives only in your URL."
- [x] **Wrap computation in try/catch** — Top-level try/catch in `/api/ical` returns structured 500 JSON with logged context; timeout returns 503 + `Retry-After`.
- [x] **Internal timeout guard** — 20s `Promise.race` deadline on the computation block; returns 503 if exceeded.
- [x] **Structured logging and per-phase timing** — `/api/ical` logs `requestId`, event counts, per-phase durations, and errors as JSON to Vercel logs.
- [x] **Test suite with Vitest** — `vitest.config.mts` + tests for `birthData` round-trip, `angularDifference` edge cases, and `getPlanetLongitude` memoization. Renamed `.ts` → `.mts` to fix `ERR_REQUIRE_ESM` with Vitest 4.x.
- [x] **Vercel Analytics** — `@vercel/analytics` installed, `<Analytics />` added to root layout.
- [x] **Subscribe URL correct domain** — Uses request headers (`host` + `x-forwarded-proto`) as fallback so the full URL is always shown regardless of env var state.
- [x] **NEXT_PUBLIC_APP_URL set** — `https://cicatriz.digital` configured in Vercel project settings.
- [x] **Fix city selection timezone lookup** — Replaced dead `timezonefinder.michelfe.eu` with a Next.js proxy route (`/api/timezone`) calling `timeapi.io`.
- [x] **Core app** — Next.js 16 App Router, `astronomy-engine` ephemeris, `ical-generator` iCal output, stateless base64url birth data token, `/api/ical` endpoint with security headers, city autocomplete via Nominatim.
