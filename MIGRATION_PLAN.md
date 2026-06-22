# LBA Directory — Migration off Base44 → Supabase + Vercel

Step-by-step plan to move LBA Directory off the Base44 platform onto **Supabase** (Postgres DB + Auth + Storage + Edge Functions) and **Vercel** (frontend hosting). Read [`HANDOFF.md`](HANDOFF.md) first for the current architecture.

> **Honest scope:** this is a multi-week project, not a weekend. Base44 currently provides the database, ~37 backend functions, file storage, 6 "Core" helper services, and hosting — all of which must be rebuilt. The single biggest decision is **auth** (Phase 5): the migration is the right moment to replace the insecure custom localStorage/base64 auth with real Supabase Auth and close SEC-3. Plan for a staging environment running in parallel and a single DNS cutover at the end.

---

## What Base44 provides today (the replacement checklist)

| Base44 thing | Used for | Replaced by |
|---|---|---|
| Entities (DB) | 13 entities (below) | Supabase Postgres tables |
| `Deno.serve` functions (~37) | backend logic | Supabase Edge Functions (also Deno) |
| `Core.UploadFile` | image uploads | Supabase Storage |
| `Core.SendEmail` + Gmail connector | emails | Resend / SendGrid (or own Gmail OAuth) |
| `Core.SendSMS` | SMS | Twilio |
| `Core.InvokeLLM` | AI chat/search | Anthropic API direct (key already used) |
| `Core.GenerateImage` | AI images | OpenAI Images / Replicate |
| `Core.ExtractDataFromUploadedFile` | file parsing | a parser lib or LLM call |
| Hosting + GitHub auto-deploy | serving the SPA | Vercel + GitHub integration |

**The 13 entities to model as tables:** `Business`, `Deal`, `Customer`, `Review`, `Favorite`, `Notification`, `Category`, `EmailSettings`, `User`, `ServiceInquiry`, `AiInteraction`, `Query`, `SearchHistory`.
⚠️ Only `Business` and `Deal` have `.jsonc` schema files; the rest are undeclared and Base44 also stores fields not in any schema (e.g. `password_hash`, `reset_token`, `claim_token`, `cover_photo_url`). **Derive the real columns from exported data, not the schema files.**

---

## Phase 0 — Prep (½ day)
- [ ] Create accounts/projects: a **Supabase** project (pick a region near NJ, e.g. `us-east`), a **Vercel** account, a **Resend** (email) account, a **Twilio** account (only if SMS is actually used — confirm), and confirm the **Stripe** account (stays the same).
- [ ] Create a `develop`/staging branch and a Supabase **staging** project so you can build the new stack in parallel without touching the live Base44 site.
- [ ] Inventory env/secrets you'll need: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `ANTHROPIC_API_KEY`, Google Maps key (rotate it — it's currently public in the repo), Twilio creds.
- [ ] Freeze plan: decide a low-traffic cutover window; from then, no new edits go to Base44.

## Phase 1 — Database schema in Supabase (2–3 days)
- [ ] For each of the 13 entities, **export a sample of real records** from Base44 (Phase 2 export) and list every field + type actually present.
- [ ] Write SQL `CREATE TABLE` migrations (use Supabase migrations). Suggested conventions:
  - `id uuid primary key default gen_random_uuid()` (Base44 ids are strings — keep them as `text` PKs during migration to preserve foreign-key references like `business_id`, `owner_id`, `user_id`, `category_id`; you can renormalize later).
  - Snake_case columns matching current field names (the frontend already uses snake_case) to minimize frontend churn.
  - `created_date`/`updated_date` → `created_at`/`updated_at timestamptz default now()` (and update reads, or keep the old names to reduce churn).
  - Add indexes on the hot lookups: `business.slug`, `business.email`, `business.status`, `business.category_id`, `customer.email`, `deal.business_id`, `favorite.user_id`, `review.business_id`.
- [ ] Decide what becomes a real relation vs stays denormalized (e.g. `subcategory_ids`, `gallery_images` arrays → `text[]` or jsonb).
- [ ] **Do NOT** put `password_hash`/`reset_token` columns on a public-readable table — see Phase 5 (auth moves to Supabase Auth).

## Phase 2 — Data export & import (2–3 days)
- [ ] Export every entity from Base44. Options: the Base44 MCP/admin `query_entities` (paginate, up to 500/call), or the public REST read endpoint `https://lbadirectory.com/api/apps/69160f6f331f1b03b4ecdf77/entities/<Entity>?limit=...`. Save each as JSON.
- [ ] Write an import script (Node) that reads each JSON and `INSERT`s into Supabase via the service-role key. Preserve original `id`s so foreign keys (`business_id`, `owner_id`, etc.) still line up.
- [ ] Re-run the export+import right before cutover to catch records added in the meantime (delta sync), or freeze writes during the window.
- [ ] Verify counts match per table (Business ≈ 320, Customer ≈ 64, etc.) and spot-check a few records.

## Phase 3 — File storage migration (1–2 days)
- [ ] Create Supabase Storage buckets (e.g. `business-images` public-read).
- [ ] Images today live on Base44/Supabase-prod URLs (`base44.app/api/.../files/...`, `media.base44.com/...`, `qtrypzzcjebvfcihiynt.supabase.co/...`). Write a script to download each `logo_url`/`cover_photo_url`/`gallery_images[]` and re-upload to your bucket, then rewrite the DB rows to the new URLs.
- [ ] Replace `Core.UploadFile` calls in the upload UIs (GalleryTab, CoverPhotoUpload, AddBusiness, AdminEditBusinessModal) with Supabase Storage uploads.

## Phase 4 — Backend functions → Supabase Edge Functions (1–2 weeks)
The ~37 functions are already Deno (`Deno.serve`), so the shell is portable. The work is replacing every `base44.asServiceRole.entities.X` call with a Supabase Postgres query.
- [ ] Scaffold `supabase/functions/<name>/index.ts` for each. Create a shared `supabase-admin` client (service-role key) helper.
- [ ] Mechanical translation map:
  - `base44.asServiceRole.entities.X.filter({a:1})` → `supabase.from('x').select('*').eq('a',1)`
  - `.list()` → `.select('*')`  (and fix the old `.list()`-then-JS-filter perf spots while you're here)
  - `.create({...})` → `.insert({...}).select().single()`
  - `.update(id,{...})` → `.update({...}).eq('id',id)`
  - `.delete(id)` → `.delete().eq('id',id)`
- [ ] Replace Core services per function: `Core.SendEmail` → Resend API; `Core.SendSMS` → Twilio; `Core.InvokeLLM` → Anthropic SDK (already imported in some); `Core.GenerateImage` → chosen image API; Gmail connector sends → Resend.
- [ ] Port the security work already done: keep the **server-stored token** logic (`updatePassword`, `sendPasswordResetEmail`, `sendPasswordSetupEmail`, claim flow) and the **`ADMIN_TASK_SECRET`** guard on migration functions. (Much of this becomes simpler/safer once auth is real — Phase 5.)
- [ ] Re-point the Stripe webhook to the new Edge Function URL in the Stripe dashboard, and re-enable `checkout.session.expired`.
- [ ] Priority order: auth functions → Stripe (createCheckoutSession/stripeWebhook/verifyCheckoutSession) → email senders → search/AI (searchBusinesses/refineSearch/claudeChat/platformHelp) → OG proxies (`b`/`businessOgProxy`) → the rest. The one-off migration functions can be dropped (they were Base44-data fixes).

## Phase 5 — Auth rebuild (THE key decision, 1 week) — and fix SEC-3 here
Today auth is a `localStorage["lba_customer"]` blob + base64 "passwords" + a wide-open entity API (anyone can write any entity from the browser). **Migrate to Supabase Auth and turn on Row-Level Security — this closes SEC-3 and the password weakness in one move.**
- [ ] Use **Supabase Auth** for real sessions (JWT) instead of the localStorage blob. Map: `Customer`/business-owner login → Supabase `auth.users`; `role` (admin/owner/user) → a `profiles` table or JWT `app_metadata`.
- [ ] **Password migration:** existing `password_hash` is base64 (not a real hash), so it can't be imported into Supabase Auth directly. Two options: (a) decode base64 → set the plaintext as the Supabase password via the admin API in a one-time script (then it's bcrypt-hashed properly), or (b) force everyone through a password reset on first login. (a) is smoother for users.
- [ ] **Enable RLS on every table.** Public read for approved businesses/categories/approved reviews; writes restricted to the owner (`owner_id = auth.uid()`) or an admin role. This is what makes the open-API problem go away — the anon key can no longer write arbitrary rows.
- [ ] Move login/role checks server-side (admin actions verified by JWT role, not the spoofable localStorage `role`).
- [ ] Rewrite `SignIn`, `UserRegister`, `BusinessOwnerRegister`, `SetPassword`, `ForgotPassword`, `ClaimBusiness`, `AdminDashboard`/`BusinessDashboard` guards to use the Supabase session.

## Phase 6 — Frontend re-wire (1–2 weeks, can overlap Phase 4/5)
- [ ] Replace `src/api/base44Client.js` with a Supabase client (`@supabase/supabase-js`).
- [ ] Find/replace patterns across `src/`:
  - `base44.entities.X.filter/list/create/update/delete` → Supabase `from('x')...` (now subject to RLS — anon only reads what it's allowed).
  - `base44.functions.invoke('name', body)` → `fetch('<edge-function-url>/name', {method:'POST', headers:{Authorization: Bearer <jwt>}, body})` or `supabase.functions.invoke('name', { body })`.
  - `base44.integrations.Core.UploadFile` → Supabase Storage upload.
- [ ] Keep the existing helpers (`dealDates.js`, `createPageUrl`, `imageUtils`, `googleMapsLoader`) — they're platform-agnostic.
- [ ] `npm run build` must stay green throughout; do it page-by-page.

## Phase 7 — Email, SMS, Stripe re-wire (2–3 days)
- [ ] Resend: verify the `lbadirectory.com` sending domain (SPF/DKIM DNS records), port all email templates (they're plain HTML strings already, with `escapeHtml` in place). Keep `office@lbadirectory.com` as the from/reply.
- [ ] Twilio: only if SMS is real (audit `Core.SendSMS` callers first — it may be unused).
- [ ] Stripe: same account/keys; just update the webhook endpoint URL + re-add `checkout.session.expired`. Test with Stripe test mode end-to-end.

## Phase 8 — Hosting & deploy on Vercel (1 day)
- [ ] Import the GitHub repo into Vercel; framework preset = Vite. Set all env vars (Supabase URL/anon key, Stripe publishable key, Google Maps key, etc. — only PUBLIC keys in the frontend; service-role/secret keys live in Edge Function env).
- [ ] Confirm `npm run build` output serves correctly (SPA fallback to `index.html` for client routes).
- [ ] Keep `lbadirectory.com` non-`www` canonical (preserve the OG/share behavior). Set up the `www`→non-`www` redirect on Vercel.

## Phase 9 — Cutover & go-live (1 day + monitoring)
- [ ] Final delta data export+import (Phase 2) so no records are lost since the last sync.
- [ ] Smoke test the staging stack end-to-end: signup → set password → login → claim → add/edit business (with image upload) → search → a paid checkout in Stripe test mode → admin approve → emails arrive.
- [ ] **DNS cutover:** point `lbadirectory.com` from Base44 to Vercel (update the A/CNAME records). Lower DNS TTL a day before so the switch is fast.
- [ ] Watch logs (Supabase + Vercel) for the first 24–48h. Keep Base44 running (not deleted) as an instant rollback for ~2 weeks.
- [ ] After confidence: decommission Base44.

---

## Rough effort estimate
| Phase | Effort |
|---|---|
| 0 Prep | ½ day |
| 1 Schema | 2–3 days |
| 2 Data | 2–3 days |
| 3 Storage | 1–2 days |
| 4 Functions | 1–2 weeks |
| 5 Auth + RLS | ~1 week |
| 6 Frontend | 1–2 weeks |
| 7 Email/SMS/Stripe | 2–3 days |
| 8 Vercel | 1 day |
| 9 Cutover | 1 day + monitoring |
| **Total** | **~5–8 weeks** for one developer (overlap shortens it) |

## Biggest risks / watch-outs
1. **Auth + password migration** — get Phase 5 right or you lock users out. Test the base64→Supabase password import on a copy first.
2. **Foreign keys** — Base44 relations are string ids (`owner_id`, `business_id`, `category_id`). Preserve ids on import or relations break.
3. **Undeclared fields** — export real data to find every column; don't trust the `.jsonc` files.
4. **Image URL rewrite** — miss a URL field and listings show broken images. Audit `logo_url`, `cover_photo_url`, `gallery_images[]`.
5. **Stripe webhook** — must be re-pointed AND `checkout.session.expired` re-enabled, or payments/cleanup break.
6. **Non-`www` + OG** — preserve canonical domain and the OG proxies, or WhatsApp/social previews regress.
7. **Do the migration in staging in parallel; one DNS cutover; keep Base44 as rollback.**

## Suggested first 3 steps to start tomorrow
1. Spin up the Supabase project + export all 13 entities to JSON (Phase 0 + 2 export).
2. Draft the Postgres schema from the exported data (Phase 1).
3. Port ONE simple read function end-to-end (e.g. `sitemap` or `searchBusinesses`) as a proof-of-concept Edge Function hitting Supabase — this validates the whole toolchain before committing to all 37.
