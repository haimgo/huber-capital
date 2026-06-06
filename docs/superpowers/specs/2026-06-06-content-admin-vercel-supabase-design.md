# Content Admin — Astro on Vercel + Supabase

**Date:** 2026-06-06
**Status:** Design approved. Awaiting spec sign-off before planning.

## 1. Goal

Give the site administrator (Gilad) a web admin to edit the site's content — the data lists, page text, images, and news — with changes going **live within seconds**, no developer or rebuild required. Keep the existing gold sci-fi design unchanged; only the content *source* changes (from `src/data/*.js` to Supabase).

## 2. Architecture

- **Hosting:** move from static GitHub Pages → **Vercel**. Vercel connects to the GitHub repo and auto-deploys on push. The GitHub Pages workflow is retired (kept in history).
- **Astro:** `output: 'server'` with the **`@astrojs/vercel`** adapter (enables SSR, API routes, middleware, and the admin). Remove `base: '/huber-capital'` and set `site` to the Vercel/custom domain (links return to root `/`).
- **Supabase:** Postgres (content) + Auth (admin login) + Storage (images).
- **Rendering:** public pages are **server-rendered** and fetch content from Supabase, with a short CDN cache (`Cache-Control: s-maxage=60, stale-while-revalidate`) for speed; edits appear within ~a minute (or immediately on hard refresh). `/admin/*` is always dynamic (no cache).
- **Design unchanged:** components/styles stay; a data layer replaces the static `data/*.js` imports.

## 3. Supabase data model

Tables (all with `id`, timestamps; list tables have `sort int`):
- **`site_settings`** — single row: `phone`, `whatsapp`, `location`, `hero_eyebrow`, `hero_title`, `hero_sub`, `manifesto_main`, `manifesto_sub`, `cta_title`, `cta_sub`.
- **`stats`** — `value`, `label`, `sort`.
- **`process_steps`** — `n`, `title`, `text`, `sort`.
- **`mistakes`** — `n`, `title`, `text`, `sort`.
- **`areas`** — `name`, `he`, `blurb`, `sort`.
- **`press`** — `outlet`, `title`, `url`, `sort`.
- **`page_sections`** — `page`, `slot`, `value` (editable headlines/paragraphs across pages; unique on `page+slot`).
- **`news`** — `title`, `slug` (unique), `date`, `excerpt`, `body` (markdown), `cover_url`, `published bool`.
- **`admins`** — `user_id` (FK to `auth.users`) — membership = write permission.
- **Storage bucket `media`** — public read; images for hero, Gilad, news covers.

**Row-Level Security (RLS):**
- All content tables: `SELECT` allowed to everyone (anon).
- `INSERT/UPDATE/DELETE`: allowed only when `EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())`.
- Storage `media`: public read; write requires the same admin check.

## 4. Auth & security

- **Supabase Auth**, email + password. One admin (Gilad) seeded into `admins`; **additional admins can be invited from within the admin UI at any time** (see §5).
- **`@supabase/ssr`** for cookie-based sessions in Astro SSR. **Middleware** (`src/middleware.ts`) guards `/admin/*` — no valid session → redirect to `/admin/login`.
- Public reads use the **anon key** (safe behind RLS). Admin writes use the **logged-in user's session** (RLS enforces admin-only).
- **Env vars (Vercel):** `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY` (client+server), `SUPABASE_SERVICE_ROLE_KEY` (server-only — seeding/user management; never shipped to client, never in git). `.env` git-ignored; `.env.example` committed.
- **Adding admins (self-serve):** an authenticated admin can invite another by email from `/admin/admins`. This calls a **server-only** API route (`/api/admins/invite`) that uses the **service-role key** with the Supabase Auth admin API to create/invite the user and add them to `admins`; the route first verifies the caller is an existing admin. Admins can also be removed there. (The Supabase dashboard remains a fallback.)

## 5. Admin interface (`/admin`)

- **Tech:** Astro SSR pages for the shell + **Preact islands** (`@astrojs/preact`) for interactive forms, using `supabase-js` with the authenticated session (RLS-protected). Lightly themed to match (dark/gold), functionality-first.
- **Routes:** `/admin/login`; `/admin` (dashboard); `/admin/settings`; `/admin/lists/[type]` (stats|process|mistakes|areas|press — list CRUD + reorder); `/admin/pages` (page-text editor); `/admin/news` + `/admin/news/[id]`; `/admin/media` (upload/browse); `/admin/admins` (manage admins).
- **Capabilities:** create/edit/delete/reorder list items; edit settings and page text; upload images (to `media`, insert URL); news CRUD with markdown body + publish toggle; **invite/remove admins**; sign out.

## 6. Public-site data layer

- `src/lib/supabase.ts` — server + browser clients (`@supabase/ssr`).
- `src/lib/content.ts` — typed fetchers (`getSettings()`, `getStats()`, `getAreas()`, `getNews()`, `getSection(page, slot)`…). Pages/components call these instead of importing `data/*.js`.
- Components keep their props API; pages pass DB data in. Graceful fallback if a fetch fails (render empty list / cached copy), so a Supabase hiccup never blanks the site.

## 7. Migration

- One-time **seed** (SQL/script) loads current content from `src/data/*.js` + inline page text into Supabase.
- Refactor pages to use `lib/content.ts`. Remove `data/*.js` once parity is confirmed (keep until then).
- Upload current placeholder images into the `media` bucket; update references.

## 8. Inputs required from client

1. **Vercel account** — connect the `haimgo/huber-capital` repo (I add the adapter/config).
2. **Supabase project** — I provide schema + RLS SQL; you run it, then share `Project URL` + `anon key`; set `SUPABASE_SERVICE_ROLE_KEY` in Vercel env (not in git).
3. **Admin email** (Gilad's) — for the first login; I seed it into `admins` and set/invite a password.
4. (Optional) custom domain on Vercel.

## 9. Phases (each leaves a working, deployable state)

0. **Vercel SSR move** — add `@astrojs/vercel`, `output: 'server'`, remove `base`; deploy on Vercel reading current `data/*.js` (no behavior change). On a feature branch; main/GitHub-Pages stays live until cutover.
1. **Supabase schema** — tables, RLS, storage, `.env.example`; seed from current content.
2. **Public data layer** — `lib/supabase`, `lib/content`; pages read from Supabase; verify parity with the gold site.
3. **Auth + admin shell + admin management** — `@supabase/ssr`, middleware guard, `/admin/login`, dashboard, and `/admin/admins` (invite/remove admins via the service-role API route).
4. **Editors** — settings, the five lists (CRUD + reorder), page text.
5. **Media + news** — image upload, news CRUD + publish.
6. **Polish & cutover** — caching headers, error fallbacks, `CLAUDE.md` + `.env.example` docs, point the domain at Vercel, retire the Pages workflow.

## 10. Risks & notes

- **Secrets:** service-role key is server-only (Vercel env), never in the client bundle or git. RLS is the primary guard; verify policies with an anon client before launch.
- **Cost:** Vercel + Supabase free tiers comfortably cover this traffic; note the (low) risk of exceeding free limits later.
- **Hosting move:** the live URL changes from `haimgo.github.io/huber-capital` to Vercel (then the custom domain). Done on a branch; cut over only when verified.
- **Maintenance:** more moving parts than the static setup (the client's chosen trade-off for live editing).
- **Auth recovery:** password reset via Supabase email; adding admins is self-serve in `/admin/admins` (Supabase dashboard as a fallback).

## 11. Out of scope (now)

- Multi-role permissions / content workflow/approvals.
- Draft previews beyond the news `published` flag.
- Internationalization of the admin UI (admin can be Hebrew labels, simple).
