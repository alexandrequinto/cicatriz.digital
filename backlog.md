# cicatriz.digital — Backlog

## In Progress

## To Do

### Bugs
- [ ] **Durable rate limiter** — In-memory `requestCounts` Map resets on every cold start. Replace with Vercel KV atomic increment with TTL, plus `Retry-After` and `X-RateLimit-*` headers. `[Security]`
- [ ] **Sign the birth data token** — Any valid base64url JSON is accepted. Add HMAC-SHA256 signature using a server secret so forged/tampered tokens are rejected before computation. `[Security]`

### Engineering
- [ ] **Deterministic response caching** — The full 12-month transit computation runs on every request. Cache the rendered ICS in Vercel KV keyed on a hash of the token, TTL 12h. This is prerequisite to scaling. `[Performance]`

### UX
- [ ] **webcal:// deep-link subscribe buttons** — Replace or augment the manual copy-paste flow with `webcal://` buttons for Apple Calendar and equivalent deep links for other clients. Single most impactful conversion improvement after the URL itself. `[Feature · Retention]`
- [ ] **Event preview on result page** — Users receive a URL with no idea what's in it. Show the next 5 upcoming events (title + date) computed server-side. Makes the value tangible and reduces subscribe hesitation. `[UX · Retention]`
- [ ] **Birth data confirmation card** — Result page shows no confirmation of what was captured. Show "Calendar for [Name] · [date] · [city]" so users can verify before subscribing, with an edit link back to the form. `[Trust · UX]`
- [ ] **Platform-specific subscribe instructions** — Current steps cover only Google Calendar desktop. Apple Calendar accepts `webcal://` one-tap links. Google Calendar on mobile doesn't support URL subscription at all. Add tabbed instructions per client with a mobile caveat. `[UX]`
- [ ] **Inline birth time warning** — The "Unknown" checkbox is easy to miss and the Moon-transit warning appears only on the result page. Surface the consequence ("Moon transits estimated") as inline help text next to the time field. `[UX]`
- [ ] **Better city search result display** — Raw truncated `display_name` is ambiguous for common city names (Paris, Springfield, Santiago). Show two lines: city name + country/state in muted text below. `[UX]`
- [ ] **Bookmark / share result page nudge** — The result URL permanently encodes all birth data and is the only way to recover the subscribe URL. Add a "Bookmark or share this page" nudge and a Web Share API button for mobile. `[UX]`
- [ ] **PWA manifest and theme-color** — No `manifest.json`, no `<meta name="theme-color">`. Mobile browser chrome stays default white. Adding manifest also enables "Add to Home Screen." `[UX]`
- [ ] **ARIA describedby on form error messages** — Error `<p>` elements have no `id` and are not linked via `aria-describedby`. Screen readers announce invalid fields but don't read the reason. WCAG 2.1 AA failure. `[Accessibility]`

### Features
- [ ] **Per-category iCal event colors** — All events render in the same default calendar color. Add `COLOR` (RFC 7986) and `X-APPLE-CALENDAR-COLOR` per category (e.g. outer transits: indigo, lunar: silver, retrograde: red). Zero-cost differentiation visible in every calendar client. `[Feature]`
- [ ] **Shareable chart summary + personalized OG image** — Decode the `data` param to compute Sun/Moon sign on the result page, show a small identity card, and generate a dynamic OG image per result so social shares show the user's chart rather than the generic brand image. `[Feature · Growth]`
- [ ] **"Generate for a friend" CTA** — The result URL is already shareable. Add a "Create one for someone else" link and a copy-result-URL button to surface the referral mechanic that's already built into the architecture. `[Feature · Growth]`

### SEO & Content
- [ ] **/guide page — what your transit events mean** — Users will see "Saturn □ natal Venus" in their calendar with no context. A minimal glossary (aspects, outer planets, retrogrades) gives the site indexable long-tail content and closes the post-subscribe dead-end. `[Content · SEO]`
- [ ] **/transit/:slug content pages** — "mercury retrograde 2026 dates," "saturn square natal sun meaning" drive real search volume. A static content layer per transit type positions cicatriz as a reference, each ending with the form CTA. `[SEO]`
- [ ] **HowTo and FAQ structured data** — Add `HowTo` schema to the result page subscribe steps and `FAQPage` schema to the /guide page to capture featured snippet real estate for "how to add astrology calendar to Google Calendar." `[SEO]`

### Growth & Monetization
- [ ] **Funnel event tracking** — Vercel Analytics is enabled but only tracks pageviews. Add custom events (form submit, copy URL click) to see where users drop off in the form → result → subscribe funnel. `[Growth · Observability]`
- [ ] **Trust signals for the privacy model** — "No account. No storage." is 10px stone-600 text — least visible element on the page. For a product collecting birth coordinates, the privacy architecture is genuinely differentiating. Give it prominent treatment with a plain-language explanation of how the token works. `[Trust · Growth]`
- [ ] **Spanish and Portuguese localization** — "Cicatriz" is Spanish/Portuguese. Astrology engagement is extremely high in Brazil, Mexico, Argentina, and Spain. Localizing UI copy and metadata would unlock large, culturally aligned markets where the brand name already resonates. `[Growth]`
- [ ] **Premium signed-URL tier** — One-time payment generates a signed token unlocking: 24-month window, additional bodies (Chiron, Nodes), richer event descriptions. No user database required — premium entitlement lives in the signed token. Preserves the no-account ethos. `[Monetization]`

## Done

- [x] **Transit interpretation copy** — 278-entry `lib/transitInterpretations.json` pre-generated via Claude Haiku (~$0.02). `lib/interpretations.ts` exports `getInterpretation(key)`. Injected at all push sites in `transits.ts`, `personalTransits.ts`, `ingresses.ts`, `lunarPhases.ts`. Zero runtime cost.
- [x] **Per-category event filtering** — 5-bit bitmask (`f` field in token). Five filter checkboxes in `NatalChartForm` (outer transits, inner transits, lunar phases, ingresses, retrogrades). Backward-compatible: absent field = all enabled. `/api/ical` validates 0–31 range.
- [x] **B&W redesign** — Pure black (#000) / white Geist Mono industrial minimalist palette. "Cicatriz" title with "Marked by the cosmos" slogan. Astrological symbols as decorative elements. All components updated: `NatalChartForm`, `SubscribeUrl`, `CitySearch`, `result/page.tsx`, `globals.css`.
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
- [x] **Wrap computation in try/catch** — Top-level try/catch in `/api/ical` returns structured 500 JSON with logged context; timeout returns 503 + `Retry-After`.
- [x] **Internal timeout guard** — 20s `Promise.race` deadline on the computation block; returns 503 if exceeded.
- [x] **Structured logging and per-phase timing** — `/api/ical` logs `requestId`, event counts, per-phase durations, and errors as JSON to Vercel logs.
- [x] **Test suite with Vitest** — `vitest.config.mts` + tests for `birthData` round-trip, `angularDifference` edge cases, and `getPlanetLongitude` memoization. Renamed `.ts` → `.mts` to fix `ERR_REQUIRE_ESM` with Vitest 4.x.
- [x] **Vercel Analytics** — `@vercel/analytics` installed, `<Analytics />` added to root layout.
- [x] **Subscribe URL correct domain** — Uses request headers (`host` + `x-forwarded-proto`) as fallback so the full URL is always shown regardless of env var state.
- [x] **NEXT_PUBLIC_APP_URL set** — `https://cicatriz.digital` configured in Vercel project settings.
- [x] **Fix city selection timezone lookup** — Replaced dead `timezonefinder.michelfe.eu` with a Next.js proxy route (`/api/timezone`) calling `timeapi.io`.
- [x] **Core app** — Next.js 16 App Router, `astronomy-engine` ephemeris, `ical-generator` iCal output, stateless base64url birth data token, `/api/ical` endpoint with rate limiting and security headers, city autocomplete via Nominatim.
