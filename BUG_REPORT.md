# LBA Directory — Bug Report

# ROUND 2 — Deep Scan (5 parallel domain audits + fix-verification)

Domains: payments end-to-end, auth/permissions, email+data lifecycle, frontend internals, and verification of all Round-1 fixes. Every finding carries `file:line` and confidence. The Round-1 fix-verification result: **all prior fixes are present and correct in the working tree; no regressions from recent commits.**

## 🔴 P0 — PAYMENTS ARE COMPLETELY BROKEN (verified by hand, pre-existing — not caused by recent fixes)

- **PAY-1. Every paid checkout returns 401 — no paid listing has ever been purchasable via the UI.** `createCheckoutSession/entry.ts:25-27` rejects requests without `customerId || customerEmail`; neither caller sends them (`AddBusiness.jsx:322-325`, `UpgradeTab.jsx:24-27`). User sees generic "Submission failed". The 401 guard predates all recent work. CONFIDENCE: certain (hand-verified).
- **PAY-2. Dashboard "Upgrade" would create a junk duplicate business, charge the customer, and never upgrade the real listing.** `UpgradeTab.jsx:26` sends `business_data: {business_id}` but the function treats it as a full new-listing payload (`createCheckoutSession/entry.ts:43-61`); the webhook then marks the empty junk record paid. Needs an explicit upgrade mode. (Masked today by PAY-1.)
- **PAY-3. "LBA Sponsor" plan unsellable.** `AddBusiness.jsx:308,323`: maps `lba-sponsor`→`pro` inside business_data but passes raw `"lba-sponsor"` as listing_tier → `priceIds["lba-sponsor"]` undefined → 400. Also not in the schema tier enum.
- **PAY-4. Stripe cancel URL is a 404** (`createCheckoutSession/entry.ts:83`: `/add-business` route doesn't exist; form state lost; pending business already created).
- **PAY-5. Paid business loses its owner.** `entry.ts:55` `owner_id: customerId || ''` clobbers the owner set in business_data → paid listing invisible in buyer's dashboard.
- **PAY-6. Wizard deals silently discarded on paid tiers** (`AddBusiness.jsx:316-331` vs `:367-371` — Deal.create only in the free branch; paid path redirects first). Also paid businesses are never geocoded (same branch issue, `:355-364`) → recreates the map-pin bug for every paid listing.
- **PAY-7. Admin can't see payment status → can approve abandoned-checkout orphans, granting premium ranking for $0.** Pending business is created with `listing_tier`/`listing_rank` BEFORE payment; `BusinessesTab` renders no `payment_status` anywhere.
- **PAY-8. No `checkout.session.expired` handling and no cleanup job** → orphan pending businesses accumulate and squat the canonical slug (real listing gets `name-2`). Stripe-create failure also strands the pre-created business (no rollback in catch, `entry.ts:91-94`).
- **PAY-9. Success page doesn't verify anything** (`Success.jsx:10-17`: hardcoded 2s spinner; shows "Payment Received!" even on direct navigation). **PAY-10.** Confirmation email lost permanently if SendEmail throws once (`stripeWebhook/entry.ts:57-77`: paid flag set before send + idempotency guard blocks the retry's email; wrap send in its own try/catch).

## 🔴 P0 — Security (NEW findings; fold into the staged security block)

- **SEC-1. Anyone can set ANY user's password through the shipped UI.** The reset link's `t` param is never validated; the legacy branch of SetPassword keys off the email URL param alone (`SetPassword.jsx:91-110` → `updatePassword`). Navigate to `/SetPassword?email=victim@x.com` → set their password. No crafted requests needed. CONFIDENCE: high.
- **SEC-2. Claim token is forgeable** — unsigned `btoa(businessId:email:expiry)` (`sendClaimEmail/entry.ts:5-8`), and `verifyClaimToken/entry.ts:48` compares against an email taken from the request body. Attacker forges both → claims any unclaimed business (incl. all 233 `lba_directory` imports), `owner_id` written server-side (`:65`). Also replayable within 24h (no nonce).
- **SEC-3. Client-side admin writes inventory** (anonymous `base44.entities.*` writes that must be permitted for the UI to work — each is a console-exploitable vector): `User.update(role)` + `User.update(password_hash)` (`UsersTab.jsx:44,99` — anonymous admin promotion/takeover), `Customer.update(password_hash)` (`CustomersTab.jsx:76`), `Business.delete` (`BusinessesTab.jsx:73`), self-approve via `Business.update(status)` (`PendingApprovalsTab.jsx:43,69`), `Business.update` with no owner check from dashboards, `Review.update(is_approved)` (`ReviewsReportsTab.jsx:38`), Category/Deal/EmailSettings writes, forgeable `user_id` on Review/Favorite creates.
- **SEC-4. Unauthenticated mass-mutation functions** — anyone can POST to `recategorizeBusinesses` (AI re-categorizes ALL businesses + burns Anthropic credits), `backfillSlugs` (breaks every inbound URL), `migrateAllBusinessRatings`, `geocodeBusinesses`, all 5 image-migration functions (storage/bandwidth abuse), `updateBusinessRatings`, `notifyFavoriteCustomers` (spam real customers). All use `asServiceRole`, zero caller checks.
- **SEC-5. `sendClaimEmail` lets an anonymous caller send an official "Claim Your Business" email to ANY address for ANY business** (`entry.ts:67` adminSent path) — phishing vector.
- **SEC-6. Open redirect**: `SignIn.jsx:29,70,112,137` feeds `?next=` to `window.location.href` unvalidated → `signin?next=https://evil.com` after successful login. **SEC-7.** Login stores the full Customer row incl. `password_hash` in localStorage (`SignIn.jsx:105` `{...customer}` spread).
- **SEC-8. Account enumeration**: `getPasswordResetInfo` returns id/name/type/hasPassword for any email; 404-vs-200 distinguishes registered emails.

## 🟠 P1 — Functional bugs

- **FUN-1. Deal dates: whole UTC-parsing family.** Date-only strings parsed as UTC midnight = 8pm previous evening in NJ: deals expire the evening BEFORE their stated last day; **editing a deal shifts its dates back one day per save** (`DealsTab.jsx:141-142` round-trip); "deal started today" email can never fire (`DealsTab.jsx:51-56`); displays show previous day. Sites: `DealsTab.jsx:342-345,375`, `OverviewTab.jsx:22-27,268`, `BusinessListing.jsx:229-232`, `AiSearch.jsx:30-38`, `SearchResults.jsx:49-57`, `CategoryListing.jsx:104-105`, `DealsSection.jsx:51`, `DealsOverviewTab.jsx:53-59,121-124`. Fix once with a shared local-date parse + inclusive end-of-day. Admin modal uses `datetime-local` while owner uses `date` (mixed formats in same field).
- **FUN-2. Admin save destroys free-text opening hours** (`AdminEditBusinessModal.jsx:120,170-172` — seeds DEFAULT_HOURS when json is null, overwrites real `opening_hours_text` with fake Sun-Fri 9-5 on ANY save).
- **FUN-3. UsersTab edits the wrong entity** — lists `Customer` records but updates `User` (`UsersTab.jsx:23` vs `:44,99`) → role change + password set silently broken.
- **FUN-4. Hours/Gallery saves never refresh the dashboard** — parent passes `onUpdate`, children expect `onBusinessUpdate` (`BusinessDashboard.jsx:284-285` vs `GalleryTab.jsx:11`/`OpeningHoursTab.jsx:11`) → stale data reappears, users think saves failed.
- **FUN-5. Admin bulk "Send Password Setup Emails" invokes a function that doesn't exist** (`AdminDashboard.jsx:339` calls `sendPasswordSetupEmails` plural; only singular exists) → tab always errors.
- **FUN-6. Ratings never recompute on review approval** — `updateBusinessRatings` only invoked at review submit (before approval); admin Show/Hide toggle never triggers recompute (`ReviewsReportsTab.jsx:70-75`) → stars/counts permanently stale.
- **FUN-7. Business email saved unnormalized re-introduces the login-case bug** — `AddBusiness.jsx` (~:295), `AdminEditBusinessModal`, `EditBusinessTab` store raw email while all readers now lowercase. Also `CustomersTab.jsx:96` admin email edit doesn't lowercase. Normalize on every email write.
- **FUN-8. Overnight-hours "Open Now" still wrong on frontend cards** (`category/BusinessCard.jsx:39`, `chat/BusinessResultCard.jsx:29` — backend #20 fix not ported; BusinessResultCard also crashes on partially-filled hours and uses device timezone).
- **FUN-9. Pending/rejected/unpaid listings publicly viewable by URL** — `BusinessListing.jsx:108-126` lookup has no status filter (now includes Stripe pre-created orphans).
- **FUN-10. Approval emails: two paths, both wrong.** Pending tab always sends password-setup (even to already-claimed owners); edit-modal approval sends only marketing `sendApprovalEmail` with NO setup link → owner approved that way cannot log in. Route by `password_hash`/`owner_id` in both.
- **FUN-11. escapeHtml missing in 6 sibling email templates** — `sendSubmissionEmail:117,176`, `sendApprovalEmail:140-147,199`, `sendWelcomeEmail:109-116`, `sendPasswordSetupEmail:111,125`, `sendClaimEmail:103-131`, `sendPasswordResetEmail:28,58` (same #17 pattern, never covered). Also `${ogImage}` unescaped in b/businessOgProxy meta tags.
- **FUN-12. AI assistant bugs**: "Apply" on short version writes `long_description` (`BusinessDashboard.jsx:116-123` ignores type arg); category/deals never passed to AiAssistantTab (prompts say "Not specified"); 30s timeout leaves permanent spinner (`AiAssistantTab.jsx:147-170`, `AskAboutBusiness.jsx:97-114`); `AskAboutBusiness.jsx:70` still reads phantom `average_rating`.
- **FUN-13. Admin edit modal leaks previous business's deals** (`AdminEditBusinessModal.jsx:135-139` — setDeals only when non-empty; persistent modal instance shows business A's deals under business B, deletable).
- **FUN-14. Phone validation rejects its own placeholder** (`EditBusinessTab.jsx:70` — regex forbids `+` and `.` but placeholder shows `+1 (732)...`).
- **FUN-15. Email pipeline wiring unverifiable**: `notifyFavoriteCustomers`/`sendWelcomeEmail`/`sendSubmissionEmail` have NO caller in the repo — they rely on Base44 dashboard automations. ACTION (Yossi): confirm these automations exist and are active in the Base44 dashboard. Also `sendBusinessEmail` silently no-ops for any email type the admin never saved in AdminEmailSettings; `$in` array-filter in notifyFavoriteCustomers is unconfirmed SDK syntax (if unsupported → "Notified 0" silently).

## 🟢 P2 — Low

`/searchresults` with no query spins forever (`SearchResults.jsx:14`); "Downgrade" button dead + no cancellation path (`UpgradeTab.jsx:15,118`); chat `pageContext` prop dropped (`Layout.jsx:348` → `ChatWindow.jsx:48`); dead components (`HeroSection`, `SearchResultsPanel`, `FeaturedBusinesses`, `LatestDeals`, `Step6Deals` — HeroSection still contains the bug-#7 pattern if ever rewired); `sendClaimEmail` claimUrl still on `www.` (works via 301, inconsistent); plain-btoa writers `CustomersTab.jsx:75`/`UsersTab.jsx:99` (login tolerates, but throws on non-ASCII); stale `claim_disabled` "not in schema" comments (field IS now in `Business.jsonc:317`); `notifyFavoriteCustomers` skips customers without `is_active`; typecheck reports shadcn `children` prop noise (no runtime impact).

## Suggested fix order (Round 2)
1. **PAY-1..3** — unblock revenue (one coherent change: pass identity from callers + dedicated upgrade mode + sponsor tier mapping).
2. **SEC-1, SEC-2** — fold into the staged security rollout, but SEC-1 is exploitable from the shipped UI today; consider an immediate tactical patch (validate a signed token server-side before updatePassword).
3. **FUN-1 (deal dates), FUN-2 (hours destruction), FUN-3/4/5 (broken admin+dashboard saves)** — daily-pain functional bugs.
4. PAY-4..10, FUN-6..15, then P2.

---

# ROUND 1 (original report)

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
