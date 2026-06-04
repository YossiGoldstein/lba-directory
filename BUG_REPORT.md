# LBA Directory — Bug Report

Generated 2026-06-03 from a parallel audit (backend functions, frontend pages, schema-vs-code). Findings carry `file:line` and impact. Severity = user/business impact, highest first. Items are NOT yet fixed unless noted — this is the triage list.

> Several findings overlap and corroborate each other across agents (e.g. the password hashing issue surfaced from both backend and frontend). Security items at the top should be prioritized and verified first.

---

## 🔴 CRITICAL — Security (account takeover / payment loss)

1. **Unauthenticated password change = full account takeover** — `base44/functions/updatePassword/entry.ts:1-63`. Accepts `{ email, password }` from ANY anonymous request and overwrites the `password_hash` of any business/customer with that email. No token, no current-password check, no auth. Anyone can take over any account. (`getPasswordResetInfo` and `sendPasswordResetEmail` also allow email enumeration.)

2. **Passwords stored as reversible base64, not hashed** — `registerCustomer/entry.ts:76`, `updatePassword/entry.ts:16`, `adminLogin/entry.ts:23-26`. `password_hash` is just `btoa(password)` (trivially reversible). `adminLogin` even accepts a plaintext == stored match. Should use a real one-way hash (bcrypt/scrypt/argon2).

3. **Admin login bypass when no password set** — `adminLogin/entry.ts:17-40`. If an admin's `password_hash` is falsy, the password check is skipped and the function returns `{ isAdmin: true }` for anyone submitting that admin email. Any unclaimed-password admin = full bypass.

4. **Unicode passwords can never log in (encoding mismatch)** — `src/pages/SignIn.jsx:83,113` compares `btoa(password)`, but `registerCustomer/entry.ts:75` stores `btoa(unescape(encodeURIComponent(password)))`. Any password with non-Latin1 chars either throws `InvalidCharacterError` on sign-in or hashes differently → user locked out. (Tied to #2 — fix together.)

## 🔴 CRITICAL — Payments

5. **Stripe metadata 500-char limit silently breaks paid listings** — `createCheckoutSession/entry.ts:34` stores `business_data: JSON.stringify(business_data)` in Stripe session metadata; `stripeWebhook/entry.ts:33` reads it back with `JSON.parse`. Stripe caps metadata values at 500 chars. A real business payload (descriptions, gallery, hours) exceeds this → session create rejected or truncated → webhook `JSON.parse` throws → **paid customer never gets their listing**. Store the payload in an entity row and pass only its id in metadata.

## 🔴 CRITICAL — Crash

6. **Homepage featured section crashes on any reviewed business** — `src/components/home/FeaturedBusinesses.jsx:106` calls `business.average_rating.toFixed(1)`, guarded only by `reviews_count > 0`. Schema has **no** `average_rating` (only `general_rating`), so the field is never written → `Cannot read properties of undefined (reading 'toFixed')` as soon as a business has ≥1 review. Standardize on `general_rating`.

---

## 🟠 HIGH

7. **Search terms force-lowercased / param mangled** — `src/pages/Home.jsx:46`, `src/pages/SearchResults.jsx:112`. Both wrap the query in `createPageUrl(...)`, which does `.toLowerCase()` on the whole string (`src/utils/index.ts:4`), corrupting the user's search term. `CategoryListing.jsx:114` builds the same URL WITHOUT `createPageUrl` (correct). Don't run query strings through `createPageUrl`.

8. **Stripe webhook not idempotent + infinite retries** — `stripeWebhook/entry.ts:27-49`. `checkout.session.completed` unconditionally `Business.create()` with no dedupe on subscription/event id → Stripe redeliveries create duplicate businesses. Also returns **400** on missing fields, which tells Stripe to retry forever. Guard fields, dedupe, return 200 after logging.

9. **Subscription confirmation email sent to null** — `stripeWebhook/entry.ts:53` uses `session.customer_email`, which is typically null for subscription checkouts (the populated field is `customer_details.email`). Confirmation silently goes to `to: null`.

10. **Claim success button drops user to wrong page** — `src/pages/ClaimBusiness.jsx:92` builds `BusinessDashboard?id=${businessId}`, but `BusinessDashboard.jsx:29` reads `urlParams.get("edit")`. After claiming, the user lands on the generic list instead of their claimed listing.

11. **Customer login email is case-sensitive** — `src/pages/SignIn.jsx:79` filters on the raw input; admin login (`:55`) normalizes `.toLowerCase().trim()`; `registerCustomer` stores email unnormalized. Register `John@X.com`, sign in `john@x.com` → auth fails. Normalize everywhere.

12. **Wizard cover photo saved under wrong key → lost** — `src/components/add-business/Step5Gallery.jsx:13,50,105` read/write `data.cover_image_url`, but `AddBusiness.jsx:305` only persists `cover_photo_url` (the real field). Cover image chosen in the wizard is never saved.

13. **Admin "disable claim" toggle never persists** — `AdminEditBusinessModal.jsx:129,179` write `claim_disabled`; `BusinessesTab.jsx:282` gates on `!business.claim_disabled`. Field is not in the Business schema → dropped on write, always falsy → toggle has no effect.

14. **"Active deals" badge is dead** — `SearchResultsPanel.jsx:80`, `chat/BusinessResultCard.jsx:133` read `business.has_deals`, which exists on no schema and is never computed. Always falsy.

15. **Ratings never render in chat / related cards** — `chat/BusinessResultCard.jsx:115,118` and `business/RelatedBusinesses.jsx:52,55` read `business.average_rating` (never populated; backend returns `general_rating`). Guarded, so no crash, but ratings silently missing.

16. **Search results cache leaks stale/empty data** — `searchBusinesses/entry.ts:8-10,106-113`. Module-global `cachedBusinesses` keyed only by time; newly-approved businesses invisible up to 5 min, and a failed first load can cache an empty set.

---

## 🟡 MEDIUM

17. **HTML/email injection via unescaped fields** — business names, deal text, and public service-inquiry fields are interpolated raw into email HTML and OG meta: `notifyFavoriteCustomers/entry.ts:91-96`, `sendBusinessEmail/entry.ts:113,116`, `submitServiceInquiry/entry.ts:42-46`, `b/entry.ts:81-84`, `businessOgProxy/entry.ts:82-85`. A `"` in a business name breaks OG tags; a malicious value injects markup/links into admin & customer emails. Escape on output.

18. **Service-inquiry form can hang forever** — `src/pages/ServiceInquiry.jsx:58`. The `invoke("submitServiceInquiry")` has no try/catch; on failure `setIsLoading(false)` never runs → button stuck on "Submitting…", inquiry silently lost.

19. **Full-table `.list()` then JS filter (perf)** — `BusinessDashboard.jsx:61`, `CategoryListing.jsx:33`, `b/entry.ts:127`, `businessOgProxy/entry.ts:128`, `updateBusinessRatings/entry.ts:13-16`, `getPasswordResetInfo`, `updatePassword`. Each downloads the whole table per request; degrades as the directory grows. Use server-side `.filter({...})`.

20. **"Open now" wrong for overnight hours** — `searchBusinesses/entry.ts:100-103`. `currentMins >= open && currentMins <= close` marks any business closing after midnight (e.g. 18:00–02:00) as closed.

21. **Email recorded as sent before sending** — `notifyFavoriteCustomers/entry.ts:57-66` sets `email_sent: true` on create, then the actual send (line 120) only logs on failure. Failed sends are recorded as sent; no retry.

22. **submitServiceInquiry forwards caller's auth header, no `.ok` check** — `submitServiceInquiry/entry.ts:33-34`. Passes the public caller's `Authorization` through to the email API and never checks the response → notification silently fails for anonymous callers.

---

## 🟢 LOW / Cleanup

23. **robots/sitemap point at a different domain** — `robots/entry.ts:10`, `sitemap/entry.ts:19-89` emit `https://lakewoodlba.com/...` while everything else uses `lbadirectory.com`. Verify the canonical host; if it's `lbadirectory.com`, search engines are being pointed at the wrong site. (Related to the WhatsApp www/non-www canonicalization already fixed.)

24. **Spoofable client-side admin gate** — `AdminDashboard.jsx:52` gates UI purely on `role === "admin"` from localStorage. Any user can set that. Real protection must be server-side per function/entity call. (Mitigated only if backend independently authorizes admin actions — verify.)

25. **Anthropic SDK unpinned** — `claudeChat`, `refineSearch`, `platformHelp`, `searchBusinesses` import `npm:@anthropic-ai/sdk` with no version (everything else is pinned). A new major can break them with no code change.

26. **Slug uniqueness is a TOCTOU race** — `AddBusiness.jsx:344-351` checks-then-creates; concurrent same-name submits can both pass → duplicate slugs.

27. **Dead/mismatched code** — `src/components/cards/BusinessCard.jsx` is unused and fully schema-mismatched (`name`, `cover_image_url`, `is_verified`, `rating_average` — would crash if wired in). `registerCustomer/entry.ts:14-56,85` defines a `sendGmail` helper + `dashboardUrl` that are never called (welcome email never sent at registration).

28. **N+1 fetch in search hydration** — `SearchResults.jsx:33-38` fires one `Business.filter({id})` per result. Batch into a single fetch.

29. **Lint: 178 unused-import errors** (mostly unused `React` imports) — cosmetic, auto-fixable with `npm run lint:fix`. Not behavioral.

---

## Suggested fix order
1. Security block: #1–#4 (auth/password) — highest risk, fix as a unit.
2. #5 (Stripe metadata) and #6 (homepage crash) — direct revenue / visible breakage.
3. HIGH list #7–#16.
4. MEDIUM, then LOW.

Items already fixed this session live in `TASKS.md` (email button text, WhatsApp www→non-www preview).
