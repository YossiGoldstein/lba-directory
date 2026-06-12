# LBA Directory — Client Fix List

Source: client screenshots/messages. Logged before fixing so the list survives session resets.

## Open

### ⚠️ STAGED — Auth security block (NOT in this deploy, needs tested rollout)
These 5 findings are interdependent and touch live user/admin access + existing stored data. Shipping them blind could lock out real users, so they are deliberately held back from the bulk deploy and need a focused, tested rollout (ideally with a password-migration step + Base44 entity-permission lockdown).
- [ ] **#1 Unauthenticated password change** (`updatePassword`) — require a valid reset/claim token.
- [ ] **#2 Reversible password "hash"** (base64) — move to a real one-way hash (PBKDF2/bcrypt) + migrate existing base64 records.
- [ ] **#3 Admin login bypass when no password set** (`adminLogin`) — deny when no hash, but FIRST confirm current admin(s) have a password so we don't lock them out.
- [ ] **#4 Unicode passwords can't log in** (encoding mismatch SignIn vs registerCustomer) — fix as part of the hashing change.
- [ ] **#11 Customer login email case-sensitive** — normalize email on register + login (needs existing-data check).
- [ ] **Root cause (architecture):** login compares `password_hash` CLIENT-SIDE (`SignIn.jsx:79`), so the hash is exposed to the browser. Real fix = server-side `customerLogin` function + lock down Customer/Business entity read perms in the Base44 dashboard (config, not code).

### Known limitations (documented in code, need a feature, not a bug fix)
- [ ] **#14 `has_deals` badge** — field isn't in schema and isn't computed anywhere; badge is inert. Needs a computed/maintained flag or a per-business deals lookup. Left as `// TODO` in `SearchResultsPanel.jsx` and `chat/BusinessResultCard.jsx`.
- [ ] **#24 Admin gate is client-side** (`AdminDashboard.jsx`) — commented; real protection must be server-side per action.
- [ ] **#28 N+1 in search hydration** — left as `// TODO` (SDK array-filter support unconfirmed).

- [x] **WhatsApp link preview shows no photo** — ROOT CAUSE: share links were built with `https://www.lbadirectory.com/...`, but the site canonicalizes `www` → non-`www` with a **301 redirect**. Facebook/WhatsApp's OG crawler (`facebookexternalhit`) does not reliably follow that cross-host 301 when scraping, so it never reads the per-business `og:image`. The non-`www` URL returns 200 + correct OG image directly (verified: `image/jpeg`, 90KB, ~1.3s).
  - FIX: point all share paths + proxy `BASE_URL` at the canonical non-`www` domain so the crawler hits 200 with no redirect hop.
    - `src/pages/BusinessListing.jsx:294` (Share button)
    - `src/components/business-dashboard/OverviewTab.jsx:60` (dashboard Copy link + WhatsApp share)
    - `base44/functions/businessOgProxy/entry.ts:5` (`BASE_URL` → also fixes `og:url`)
    - `base44/functions/b/entry.ts:5` (`BASE_URL` → short-link proxy)
  - CAVEAT: WhatsApp caches previews per-URL. Links shared BEFORE this fix (the `www` ones) may still show no image from cache; newly-shared non-`www` links scrape fresh. Test with a brand-new share after deploy.
  - NOTE (not changed): email-footer display text `www.lbadirectory.com` in send*Email functions is cosmetic, left as-is.

## Done

- [x] **PAYMENTS FIX (Round-2 PAY-1..10)** — paid checkout was entirely broken (401: callers never sent `customerId`/`customerEmail`). Coordinated fix across 7 files:
  - `createCheckoutSession`: tier alias (`lba-sponsor`→pro, PAY-3); explicit **upgrade mode** keyed on `business_data.business_id` (no junk duplicate, PAY-2); preserves caller `owner_id` (PAY-5); creates wizard `deals` server-side (PAY-6); `listing_rank: 1` until paid (PAY-7); rollback of business+deals if Stripe session-create fails (PAY-8); cancel URL fixed to `/AddBusiness` (PAY-4); email lowercased on create.
  - `stripeWebhook`: upgrade-aware idempotency; writes `listing_tier`+`listing_rank` on payment; cancels superseded subscription on upgrade (no double-billing); `checkout.session.expired` handler deletes abandoned pending businesses + their deals (PAY-8); confirmation email is best-effort try/catch (PAY-10) with upgrade-specific copy.
  - NEW `verifyCheckoutSession` function + `Success.jsx` rewrite: real Stripe verification instead of fake 2s spinner (PAY-9); distinct paid/upgraded/processing/unknown states.
  - `AddBusiness.jsx`: sends identity + `deals`, geocodes BEFORE redirect (paid listings get map pins, PAY-6/M2).
  - `UpgradeTab.jsx`: sends identity from session.
  - Admin visibility (PAY-7): red **NOT PAID / PAYMENT FAILED** badge in `PendingApprovalsTab` + `BusinessesTab`.
  - ⚠️ NEEDS LIVE TEST: full Stripe checkout (test card or real+refund) + verify the `checkout.session.expired` webhook event type is enabled in the Stripe dashboard webhook config.

- [x] **"Can't log in after creating an account"** (client report — CONFIRMED) — ROOT CAUSE: login matched email **case-sensitively**, and phone keyboards auto-capitalize the first letter (and autocomplete adds trailing spaces). Production evidence: 8/64 Customer emails + 18 Business emails stored with uppercase letters. Secondary: registration (registerCustomer) and login (SignIn) used **different password-hash encodings** (UTF-8-safe vs plain btoa) — breaks any non-ASCII password.
  - CODE FIX (lowercase+trim email everywhere; login accepts both hash encodings; all writes now UTF-8-safe): `SignIn.jsx`, `BusinessOwnerRegister.jsx`, `SetPassword.jsx`, `registerCustomer`, `updatePassword` (also switched to `.filter()`), `getPasswordResetInfo`, `sendPasswordResetEmail`.
  - DATA FIX (production, via MCP): normalized 8 Customer + 18 Business emails to lowercase.

- [x] **Map doesn't show location for some listings** (e.g. park-ave-appliance) — ROOT CAUSE: those businesses have `latitude/longitude = null` (bulk-imported with `owner_id: "lba_directory"`, skipped the geocode-on-create step). The map then falls back to geocoding the address, but it used **Nominatim**, which fails on real stored formats like "1750 Cedarbridge Ave" (verified: Nominatim returns nothing for that exact string, but resolves "Cedar Bridge Avenue" variants). FIX: `SingleBusinessMap.jsx` now geocodes via the **Google Maps JS Geocoder** (already loaded for the map; tolerant of abbreviations) instead of Nominatim — fixes the live pin for all coord-less listings. Build passes.
  - UPDATE: the Maps key does NOT have the **Geocoding API** enabled (REST + JS Geocoder return `REQUEST_DENIED`), and Nominatim cannot resolve "Cedarbridge" in ANY form (OSM has it as "Cedar Bridge Avenue"). Search-results map only ever uses STORED coords (spirals coord-less ones), which is why it always shows. `SingleBusinessMap` is now **hybrid**: Google Geocoder first → Nominatim fallback. Restores pins for well-formatted addresses immediately; messy ones (Cedarbridge) need the Geocoding API.
  - ACTION (Yossi): enable **Geocoding API** for key `AIzaSyDfr...FDc8` in Google Cloud Console → APIs & Services → Library → "Geocoding API" → Enable. Then messy addresses resolve via Google.
  - Optional follow-up: backfill stored `latitude/longitude` server-side once Geocoding API is on (the `geocodeBusinesses` function also uses brittle Nominatim — switch it to the Google Geocoding REST API + run once) so coords are permanent and no client geocoding is needed.

- [x] **Site-wide coordinate backfill** (production data, via Base44 MCP) — scanned all 248 businesses missing lat/lng. 13 had a real street address and were geocoded + saved directly to the records (park-ave-appliance + 12 more). Remaining: **233 have no street address** (only city "Lakewood") — cannot be precisely placed; needs street addresses added (data-entry, owner/admin task), not a geocoding fix. the 2 Nominatim couldn't resolve were fixed via **US Census geocoder** (Handypro — 44 Genesee Pl) and **Nominatim one-word spelling** (Crash To Class — "39 Chambersbridge Road, Brick Plaza"). All 15 street-address businesses now mapped. Only 1 junk record skipped ("test business"). 233 city-only listings intentionally get no map (per code change below).

- [x] **Map only for businesses with a real address** — `BusinessListing.jsx` no longer renders the Location map for city-only listings; `GoogleMap.jsx` (search/category) no longer plots coordless businesses as fake spiral pins; `SingleBusinessMap.jsx` city-only geocode fallback removed. Pushed (313c16d).


- [x] **Approval email button text** — "Your Listing is Live!" email button said **"Claim My Business"**, confusing people since it actually sets their password. Changed to **"Set My Password"**.
  - File: `base44/functions/sendPasswordSetupEmail/entry.ts:129`
  - Note: the *separate* claim email (`sendClaimEmail`, "Take control of your listing") is a different email — don't confuse them.

- [x] **Claim email button text** — first-person CTA for consistency. Changed button from **"Claim Your Business"** to **"Claim My Business"**. Header (h1) and subject line stay "Claim Your Business".
  - File: `base44/functions/sendClaimEmail/entry.ts:110`

### Bug-scan batch (2026-06-04) — frontend build passes, backend diffs reviewed

CRITICAL
- [x] **#5 Stripe metadata 500-char limit** — `createCheckoutSession` now creates the Business up-front (pending/unpaid) and stores only `business_id` in metadata; `stripeWebhook` looks it up and marks it paid. (Also fixes #8 + #9.) Abandoned checkouts leave a `pending/unpaid` record (not shown publicly) — admin can clean up.
- [x] **#6 Homepage crash on reviewed business** — `FeaturedBusinesses.jsx:106` `average_rating` → `(general_rating || 0)`.
- [x] **#8 Stripe webhook idempotency** — webhook updates an existing record by id (skips if already paid); missing-metadata cases now `break`→200 instead of 400 retry-storm.
- [x] **#9 Confirmation email to null** — uses `customer_details.email || customer_email`, guarded.

HIGH
- [x] **#7 Search term lowercased** — `Home.jsx:46`, `SearchResults.jsx:112` no longer route the query through `createPageUrl`.
- [x] **#10 Claim success → wrong page** — `ClaimBusiness.jsx:92` now `?edit=` (matches `BusinessDashboard`).
- [x] **#12 Wizard cover photo lost** — `Step5Gallery.jsx` `cover_image_url` → `cover_photo_url`.
- [x] **#13 "Disable claim" toggle never persisted** — added `claim_disabled` to `Business.jsonc` schema (admin must confirm field exists in Base44 after deploy).
- [x] **#15 Ratings missing in chat/related cards** — `average_rating` → `general_rating`.
- [x] **#16 Search cache stale/empty** — no longer caches an empty result.
- [x] **#19 Full-table `.list()` perf** — server-side `.filter()` in `BusinessDashboard`, `CategoryListing`, `b`, `businessOgProxy`, `updateBusinessRatings`, `getPasswordResetInfo`.

MEDIUM
- [x] **#17 HTML/email injection** — `escapeHtml` helper added + applied in `notifyFavoriteCustomers`, `sendBusinessEmail`, `submitServiceInquiry`, `b`, `businessOgProxy`.
- [x] **#18 Service-inquiry form hang** — try/catch/finally + toast.
- [x] **#20 "Open now" overnight hours** — handles close-past-midnight.
- [x] **#21 email_sent set before send** — `notifyFavoriteCustomers` now sets it true only after a successful send.
- [x] **#22 submitServiceInquiry auth header forwarding** — switched to `asServiceRole...SendEmail`, added failure handling.

LOW
- [x] **#23 robots/sitemap wrong domain** — `lakewoodlba.com` → `lbadirectory.com`.
- [x] **#25 Anthropic SDK unpinned** — pinned `@0.65.0` + guarded `content[0].text` in `claudeChat`, `refineSearch`, `platformHelp`, `searchBusinesses`.
- [x] **#26 / #27 documented** — slug TOCTOU noted; unused `cards/BusinessCard.jsx` marked.
