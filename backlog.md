# cicatriz.digital — Backlog

## In Progress

## To Do

### Brand & Trust
- [ ] **Branding: cicatriz.digital** — Replace remaining generic "Astro iCal" references in code/config with cicatriz.digital. Define brand voice: precise, understated, personal.
- [ ] **No data retention notice** — Add clear, prominent privacy statement throughout the UI: birth data lives only in the URL, nothing is stored server-side. Show inline on form, on result page, and in footer.
- [ ] **Custom domain** — Point cicatriz.digital to Vercel deployment and set `NEXT_PUBLIC_APP_URL` accordingly.
- [ ] **Subscribe URL uses correct domain** — The iCal subscribe URL shown to users on the result page must use `https://cicatriz.digital` as the base. Currently falls back to the Vercel preview URL if `NEXT_PUBLIC_APP_URL` is unset. Blocked by: Custom domain item above.

## Done

- [x] **Metadata & social sharing** — Full SEO and social metadata under the cicatriz.digital brand: page title/description, Open Graph tags, Twitter/X card, dynamic OG image (1200×630), JSON-LD WebApplication schema, favicon (☽ 32px) and Apple touch icon (180px). Removed leftover purple gradient from layout.tsx.
