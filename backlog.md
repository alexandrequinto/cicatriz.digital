# cicatriz.digital — Backlog

## In Progress

## To Do

### Bugs
- [ ] **Stable iCal event UIDs** — `calendarBuilder` generates a random UID per event on every request. Calendar clients (Google, Apple) create duplicate entries on each refresh instead of updating existing ones. UIDs must be deterministic, derived from planet + aspect + natal target + approximate date. `[Engineering · Correctness · High]`
- [ ] **Drop open-ended personal transit at window edge** — `getPersonalTransits` silently drops any transit still within orb on the last loop iteration. The equivalent case is handled in `getOuterTransits` but missing here. `[Engineering · Correctness]`
- [ ] **False retrograde events at sign boundaries** — `getIngressAndRetrogradeEvents` can fire a spurious retrograde or direct station immediately after a sign ingress because `prevLon` is not reset when `prevSign` changes, producing a corrupt delta across the 30° boundary. `[Engineering · Correctness]`
- [ ] **City search state desync on timezone failure** — When `timeapi.io` fails, the input shows the selected city label but `tz` is empty, so the form error says "select a city" rather than "timezone lookup failed." Input should reset to the pre-selection query on failure. `[UX · Correctness]`
- [ ] **Fix robots.txt sitemap URL** — Currently points to `your-app.vercel.app`. Should be `https://cicatriz.digital/sitemap.xml`. Quick fix, blocks day-one SEO. `[SEO · Quick win]`
- [ ] **Correct "refreshes every 6 hours" copy** — Google Calendar ignores `X-PUBLISHED-TTL` and polls every 12–24h in practice. UI copy on landing page and result page promises 6h. Change to "Updates daily" or "Google Calendar checks periodically." `[Trust · Quick win]`

### Brand & Domain
- [ ] **Branding cleanup** — Remove remaining "Astro iCal" references in `package.json`, `prodId` in `calendarBuilder`, and any other config. `[Brand · Quick win]`

### Engineering
- [ ] **Deterministic response caching** — The full 12-month transit computation runs on every request. Cache the rendered ICS in Vercel KV keyed on a hash of the token, TTL 12h. This is prerequisite to scaling. `[Performance]`
- [ ] **Memoize planet longitude calls** — `getIngressAndRetrogradeEvents` fetches the same longitude 2–3× per step per planet. Pre-compute a longitude table once per planet and reuse across all callers. `[Performance]`
- [ ] **Durable rate limiter** — In-memory `requestCounts` Map resets on every cold start. Replace with Vercel KV atomic increment with TTL, plus `Retry-After` and `X-RateLimit-*` headers. `[Security]`
- [ ] **Sign the birth data token** — Any valid base64url JSON is accepted. Add HMAC-SHA256 signature using a server secret so forged/tampered tokens are rejected before computation. `[Security]`
- [ ] **Validate decoded birth data fields** — Date string, lat/lng ranges, time format, and IANA timezone identifier are not validated after decode. An invalid date silently produces NaN passed to astronomy-engine. `[Reliability]`
- [ ] **Wrap computation in try/catch** — An unhandled exception in any generator produces a 500 with no body and no logged context. Add a top-level try/catch, structured error log, and a clean 500 JSON response. `[Reliability]`
- [ ] **Internal timeout guard** — No deadline on the synchronous computation loop. If the scan runs long, Vercel terminates mid-stream with a silent 504. Return a 503 + `Retry-After` if a budget (~20s) is exceeded. `[Reliability]`
- [ ] **Structured logging and per-phase timing** — Zero observability today. Log request IP hash, token hash, per-generator durations, event counts, and response status as structured JSON to Vercel logs. `[Observability]`
- [ ] **Test suite with Vitest** — No tests exist. Highest-risk paths: token round-trip, `angularDifference` at 0°/360° wrap, sign cusp boundary in `getSign`, open-ended transit fallback, retrograde across sign boundary, lunar phase loop termination. `[Testing]`

### UX
- [ ] **Birth data confirmation card** — Result page shows no confirmation of what was captured. Show "Calendar for [Name] · [date] · [city]" so users can verify before subscribing, with an edit link back to the form. `[Trust · UX]`
- [ ] **Event preview on result page** — Users receive a URL with no idea what's in it. Show the next 5 upcoming events (title + date) computed server-side. Makes the value tangible and reduces subscribe hesitation. `[UX · Retention]`
- [ ] **Platform-specific subscribe instructions** — Current steps cover only Google Calendar desktop. Apple Calendar accepts `webcal://` one-tap links. Google Calendar on mobile doesn't support URL subscription at all. Add tabbed instructions per client with a mobile caveat. `[UX]`
- [ ] **Inline birth time warning** — The "Unknown" checkbox is easy to miss and the Moon-transit warning appears only on the result page. Surface the consequence ("Moon transits estimated") as inline help text next to the time field. `[UX]`
- [ ] **Better city search result display** — Raw truncated `display_name` is ambiguous for common city names (Paris, Springfield, Santiago). Show two lines: city name + country/state in muted text below. `[UX]`
- [ ] **PWA manifest and theme-color** — No `manifest.json`, no `<meta name="theme-color">`. Mobile browser chrome stays default white. Adding manifest also enables "Add to Home Screen." `[UX]`
- [ ] **ARIA describedby on form error messages** — Error `<p>` elements have no `id` and are not linked via `aria-describedby`. Screen readers announce invalid fields but don't read the reason. WCAG 2.1 AA failure. `[Accessibility]`
- [ ] **Bookmark / share result page nudge** — The result URL permanently encodes all birth data and is the only way to recover the subscribe URL. Add a "Bookmark or share this page" nudge and a Web Share API button for mobile. `[UX]`

### Features
- [ ] **Per-category iCal event colors** — All events render in the same default calendar color. Add `COLOR` (RFC 7986) and `X-APPLE-CALENDAR-COLOR` per category (e.g. outer transits: indigo, lunar: silver, retrograde: red). Zero-cost differentiation visible in every calendar client. `[Feature]`
- [ ] **webcal:// deep-link subscribe buttons** — Replace or augment the manual copy-paste flow with `webcal://` buttons for Apple Calendar and equivalent deep links for other clients. Single most impactful conversion improvement after the URL itself. `[Feature · Retention]`
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

- [x] **Vercel Analytics** — `@vercel/analytics` installed, `<Analytics />` added to root layout.
- [x] **Subscribe URL correct domain** — Uses request headers (`host` + `x-forwarded-proto`) as fallback so the full URL is always shown regardless of env var state.
- [x] **NEXT_PUBLIC_APP_URL set** — `https://cicatriz.digital` configured in Vercel project settings.
- [x] **Metadata & social sharing** — Full SEO and social metadata under the cicatriz.digital brand: page title/description, Open Graph tags, Twitter/X card, dynamic OG image (1200×630), JSON-LD WebApplication schema, favicon (☽ 32px) and Apple touch icon (180px). Removed leftover purple gradient from layout.tsx.
- [x] **Redesign UI** — Replaced purple palette with warm charcoal + amber. Astrological symbols replace emojis. Compact mobile-first layout (max-w-lg, reduced padding, 2-col date/time row).
- [x] **Fix city selection timezone lookup** — Replaced dead `timezonefinder.michelfe.eu` with a Next.js proxy route (`/api/timezone`) calling `timeapi.io`.
- [x] **Core app** — Next.js 14 App Router, `astronomy-engine` ephemeris, `ical-generator` iCal output, stateless base64url birth data token, `/api/ical` endpoint with rate limiting and security headers, city autocomplete via Nominatim.
