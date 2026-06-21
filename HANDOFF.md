# LBA Directory — Developer Handoff

A practical onboarding doc for a developer joining the LBA Directory project. Read this top to bottom before touching code. Detailed per-bug logs live in [`BUG_REPORT.md`](BUG_REPORT.md), [`TASKS.md`](TASKS.md), and [`EMAIL_AUDIT.md`](EMAIL_AUDIT.md).

---

## 1. What this is

LBA Directory is a local-business directory web app for the Lakewood, NJ area (serving Lakewood, Toms River, Jackson, Brick, Howell, Manchester). Businesses get listings; shoppers search/browse; business owners can claim and manage their listing; admins moderate everything. There are paid listing tiers via Stripe.

- **Live site:** https://lbadirectory.com  (canonical, non-`www`)
- **Repo:** https://github.com/YossiGoldstein/lba-directory  (branch: `main`)
- **Counts:** ~34 pages, ~37 backend functions, 2 declared entities (Business, Deal).

## 2. Tech stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite, Tailwind CSS, shadcn/ui, @tanstack/react-query, react-router v6 |
| Backend | **Base44** platform — `@base44/sdk` for entities/functions/integrations |
| Functions | Deno (`Deno.serve`) — each is `base44/functions/<name>/entry.ts` |
| Payments | Stripe (subscriptions) |
| Email | Gmail connector (via Base44 connectors) + Base44 `Core.SendEmail` |
| Maps | Google Maps JS API + fallback geocoders (Nominatim / US Census) |

## 3. How hosting & deploy works (important)

- The app is **hosted on Base44**, not Vercel/Netlify. Base44 serves the SPA and the backend functions at `https://lbadirectory.com/functions/<name>`.
- The GitHub repo is **connected to the Base44 app**. **Pushing to `main` triggers Base44 to sync and rebuild** — that is the deploy. There is no separate deploy step. (Base44 also occasionally auto-commits, e.g. "Update base44 packages" — `git pull --rebase` before pushing.)
- **Production Base44 app id:** `69160f6f331f1b03b4ecdf77`.
- Functions and entity-schema changes both sync from the repo.

## 4. Local dev

```bash
npm install
npm run dev        # vite dev server
npm run build      # production build (use this to catch breakages)
npm run lint       # eslint (NOTE: ~178 "unused React import" errors are pre-existing noise)
```
- Node 18+ (project was built/tested on Node via Homebrew).
- There is **no local way to run/compile the Deno functions** — they only run on Base44. Be careful editing them; a syntax error won't surface until it deploys. Validate logic by reading.

## 5. Repo layout

```
src/
  pages/                 # ~34 route pages (Home, BusinessListing, SignIn, AddBusiness, AdminDashboard, ...)
  components/
    admin/               # admin dashboard tabs (Businesses, Customers, Users, Reviews, Deals, PendingApprovals, ...)
    business-dashboard/  # owner dashboard tabs (Edit, Gallery, Hours, Deals, AiAssistant, Upgrade, ...)
    business/ chat/ home/ maps/ category/ footer/ dashboard/ ...
    lib/                 # imageUtils, geocodeUtils, googleMapsLoader, plansConfig
  lib/                   # dealDates.js (local-date helpers), app-params.js
  api/base44Client.js    # the Base44 client (requiresAuth: false)
  utils/index.ts         # createPageUrl (LOWERCASES its input — never pass a query string through it)
base44/
  functions/<name>/entry.ts   # ~37 Deno functions
  entities/Business.jsonc, Deal.jsonc   # entity schemas (see gotcha #3 — schemas lag reality)
```

## 6. Architecture & critical context (read this — it explains most of the codebase)

1. **Auth is CUSTOM, not Base44 native auth.** Session is a JSON blob in `localStorage["lba_customer"]` = `{ id, email, role, ... }`. Login is the `/SignIn` page → `adminLogin` function (admins) or a direct `Customer`/`Business` entity lookup (customers/owners). Do **not** use `base44.auth.*` (Base44 hosted auth) — three pages mistakenly did and were fixed. New protected pages should read `localStorage["lba_customer"]` and redirect to `createPageUrl("SignIn")`.
2. **The Base44 client uses `requiresAuth: false`** (`src/api/base44Client.js`). This means the entity REST API is **publicly readable and writable from the browser**. The admin/owner UIs rely on this (they call `base44.entities.X.update(...)` directly). ⚠️ This is the open **SEC-3** security gap — see §8.
3. **Passwords are base64, not hashed.** `password_hash` = `btoa(unescape(encodeURIComponent(password)))` (UTF-8-safe base64). This is reversible — a known weakness, deferred. Login (`SignIn.jsx`) accepts both the UTF-8-safe and legacy plain-`btoa` encodings.
4. **Password-reset / setup / claim use server-stored single-use tokens.** Random hex tokens stored on the record (`reset_token`/`reset_token_expiry`, `claim_token`/`claim_token_expiry`/`claim_email`), verified server-side and consumed on use. The old reversible/forgeable `btoa(id:email:expiry)` tokens were removed. `updatePassword` prefers an `accountId`+`accountType` lookup (immune to email casing) and falls back to email.
5. **Emails are matched case-insensitively everywhere now** — all email writes lowercase+trim. Phone keyboards auto-capitalize, which broke login/password before this. Keep normalizing email on every new write path.
6. **Canonical domain is non-`www`.** `www.lbadirectory.com` 301-redirects to `lbadirectory.com`, and crawlers (WhatsApp/OG) don't follow that reliably — so share/OG URLs must be non-`www`. The OG proxies are `functions/b` and `functions/businessOgProxy`.
7. **Deal dates are date-only strings parsed locally.** Use `src/lib/dealDates.js` (`parseLocalDate`/`dealStart`/`dealEnd`/`isWithinDealWindow`) for any deal-date logic — `new Date("YYYY-MM-DD")` parses as UTC and shifts a day in NJ.

## 7. What was fixed (this engagement)

All on `main`. Newest first; see commit messages for detail.

**Payments** (`8f51ece`) — paid checkout was 100% broken (callers never sent identity → 401). Fixed: caller identity passed; dedicated **upgrade mode** (was creating junk duplicate businesses); `lba-sponsor` tier billable; owner_id preserved; wizard deals + geocoding ride along on paid submissions; listing rank granted only after payment; rollback on Stripe failure; `checkout.session.expired` cleanup of abandoned listings; old-subscription cancel on upgrade; real payment verification on `/Success` (new `verifyCheckoutSession` fn); NOT-PAID badges in admin.

**Auth / passwords** (`fdb9c85`, `4c2d403`, `47e0fac`, `3f534d7`, `cc052a6`) — case-sensitive email login fixed + 26 prod emails normalized; password-hash encoding unified; "Failed to set password" (capital-letter business emails) fixed via id-based lookup + email normalization on all write paths; **SEC-1** unauthenticated password-set closed (token now required, server-verified); generic error message now shows the real reason; **SEC-2** forgeable claim token replaced with server-stored token. *Live-verified end-to-end against production.*

**Maps** (`93882d3`, `9196393`, `313c16d`) — coord-less listings now geocode (Google→Nominatim hybrid) and 15 businesses had coordinates back-filled directly into prod; map only shows for businesses with a real address (no fake pins).

**Deals** (`4c2d403`) — full UTC date-parsing family fixed via `dealDates.js` (deals no longer expire a day early; edit no longer shifts dates).

**Comprehensive bug pass** (`29cf27b`) — admin (hours-destruction on save, deal leak, UsersTab wrong-entity, ratings recompute on review approval, approval-email routing), dashboard (save-refresh prop mismatch, AI apply/context/spinner, phone validation), public (overnight Open-Now, hide non-approved listings, card field mismatches), security (open-redirect, password_hash out of localStorage), emails (escapeHtml across all templates), plus new finds: dead Contact form now sends (`submitContactMessage`), 3 pages using wrong auth, search-500 hardening, etc.

**Security hardening** (`cc052a6`) — **SEC-4**: 8 dangerous unauthenticated migration functions locked fail-closed behind `ADMIN_TASK_SECRET` (`x-admin-secret` header).

**P2 cleanup** (`d565cb6`) — empty-search spinner, real Pricing page, safe admin hashing, email escaping, misc.

**Bulk tooling** (`05deb9f`) — working bulk "Send Password Setup Emails" (`sendPasswordSetupEmails`) + email-data audit.

## 8. What's still open (TODO)

### Code / architecture
- **SEC-3 — entity permissions are wide open (the big one).** Because the client is `requiresAuth: false`, anyone can read/write entities directly from the browser console (`base44.entities.User.update({role:'admin'})`, self-approve a business, set another user's password, delete listings, etc.). The admin/owner UIs depend on this being open. **Proper fix requires Base44 entity-level RLS (Row-Level Security) config in the Base44 dashboard, and ideally a real server-side session instead of the localStorage blob.** This is config + architecture, not a pure code change. Full per-entity exploit inventory is in `BUG_REPORT.md` (SEC-3 / "client-side admin writes").
- **Passwords should be a real hash** (bcrypt/scrypt/argon2) instead of base64, with a migration of existing records. Login should move fully server-side (currently the hash is compared client-side and the entity API exposes it). Bundle with SEC-3.
- **Claim-token email check still trusts a client-supplied `userEmail`** (the localStorage session) — fine once SEC-3 lands a real session.
- Minor leftovers noted in `BUG_REPORT.md` Round-3 (e.g. dead components `HeroSection`/`SearchResultsPanel`/`LatestDeals`/`Step6Deals` could be deleted; some functions like `notifyFavoriteCustomers`/`sendWelcomeEmail` rely on Base44 dashboard automations being configured — verify they're active).

### Data (not code — see `EMAIL_AUDIT.md`)
- **204 of 301 password-less approved businesses have NO email on file** — they can't be onboarded by email at all. Collecting these emails is the real bottleneck to signups.
- 2 duplicate-email pairs to resolve (J2 Pizza N/S; AI With Yossi / G-VANS).
- A few typo domains (e.g. `repair@spilmans.con`).

### Operational (Yossi / admin — not code)
- **Resend** password-setup emails — links sent before the token change are dead (use the per-business button or the bulk tool).
- **Stripe dashboard → Webhooks:** enable the **`checkout.session.expired`** event (the abandoned-checkout cleanup depends on it).
- To run any locked migration function, set **`ADMIN_TASK_SECRET`** in the Base44 project env and pass it as the `x-admin-secret` header.
- The Google Maps key does **not** have the **Geocoding API** enabled — enabling it lets messy addresses (e.g. "Cedarbridge Ave") resolve via Google instead of the Nominatim fallback.

## 9. Gotchas & landmines

1. **Don't pass query strings through `createPageUrl()`** — it lowercases the whole string. Use `` `${createPageUrl("SearchResults")}?query=${...}` ``.
2. **Don't use `base44.auth.*`** — this app uses the custom localStorage auth (§6.1).
3. **Entity schemas (`.jsonc`) lag reality.** Base44 persists fields that aren't declared in the schema (e.g. `reset_token`, `claim_token`, `cover_photo_url`, `password_hash`). So a field missing from the `.jsonc` does NOT mean it doesn't exist/work in prod. Verify against actual records, not just the schema file.
4. **Deal dates:** always go through `src/lib/dealDates.js` (UTC-vs-local trap).
5. **Share/OG URLs must be non-`www`** (§6.6).
6. **Deno functions can't be built locally** — edit carefully; a typo deploys before it's caught.
7. **Rating field is `general_rating`**, not `average_rating` (a phantom field that caused several bugs). Cover image is `cover_photo_url`.
8. **Base44 may auto-commit to `main`** — always `git pull --rebase` before pushing.

## 10. Reference docs in this repo
- [`BUG_REPORT.md`](BUG_REPORT.md) — full audit (Round 1, 2, 3) with `file:line`, severity, confidence for every issue found.
- [`TASKS.md`](TASKS.md) — running log of everything done + what's open, in completion order.
- [`EMAIL_AUDIT.md`](EMAIL_AUDIT.md) — the missing/duplicate/typo email analysis of all approved businesses.
