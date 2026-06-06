# Content Admin (Vercel + Supabase) Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement task-by-task. Steps use checkbox (`- [ ]`). Work on branch `admin-cms` (off `main`); the live gold site on `main` stays untouched until cutover.

**Goal:** Add a Supabase-backed admin so the owner can edit all site content (data lists, page text, images, news) with changes live within ~a minute, hosted on Vercel (SSR).

**Architecture:** Astro switches to `output: 'server'` with `@astrojs/vercel`. Supabase provides Postgres (content), Auth (admin login), and Storage (images). Public pages SSR-fetch content via a typed data layer; `/admin/*` is auth-guarded by middleware. Writes are RLS-restricted to members of an `admins` table; new admins are invited via a server-only service-role API route.

**Tech Stack:** Astro 4 (SSR), `@astrojs/vercel`, `@astrojs/preact` + Preact (admin islands), `@supabase/supabase-js`, `@supabase/ssr`, Tailwind, Supabase (Postgres/Auth/Storage), Vercel.

**Verification approach (domain-adapted):** Each task ends with `npm run build` passing and, where logic is pure (admin-check, content mappers), a small `vitest` unit test. Live/integration checks (login, RLS, saving) are grouped into explicit **"verify with keys"** steps that run after the client supplies a Supabase project — these are gated, not skipped.

**Client prerequisites (cannot be done by the agent):**
- C1. Create a **Supabase** project; share `Project URL` + `anon` key; keep the `service_role` key for env.
- C2. Create a **Vercel** project from the `haimgo/huber-capital` repo; set env vars (below); set Production Branch to `main` (deploys happen at cutover).
- C3. Decide the **admin email** (Gilad's) for the first login.

---

## File Structure

```
astro.config.mjs                    # MODIFY: vercel adapter, output 'server', remove base
package.json                        # MODIFY: deps
.env.example                        # NEW (committed) ; .env is git-ignored
supabase/schema.sql                 # NEW: tables, RLS, storage policies, admins()
supabase/seed.sql                   # NEW: seed from current content
src/lib/supabase.ts                 # NEW: server + browser client factories (@supabase/ssr)
src/lib/admin.ts                    # NEW: isAdmin(client) helper
src/lib/content.ts                  # NEW: typed fetchers (getSettings, getStats, ...)
src/lib/types.ts                    # NEW: content TypeScript types
src/middleware.ts                   # NEW: guard /admin/* (except /admin/login)
src/pages/admin/login.astro
src/pages/admin/index.astro         # dashboard
src/pages/admin/settings.astro
src/pages/admin/lists/[type].astro  # one route, all five lists (DRY)
src/pages/admin/pages.astro
src/pages/admin/news/index.astro
src/pages/admin/news/[id].astro
src/pages/admin/media.astro
src/pages/admin/admins.astro
src/pages/api/admins/invite.ts      # server, service-role
src/pages/api/admins/remove.ts      # server, service-role
src/components/admin/LoginForm.tsx
src/components/admin/ListEditor.tsx # generic, config-driven for all 5 lists
src/components/admin/SettingsForm.tsx
src/components/admin/PagesForm.tsx
src/components/admin/NewsEditor.tsx
src/components/admin/MediaManager.tsx
src/components/admin/AdminsManager.tsx
src/components/admin/AdminShell.astro# nav chrome for admin pages
src/pages/{index,investment,process,projects,about,press,contact}.astro  # MODIFY: read from content.ts
```

---

## Phase 0 — Vercel SSR migration (agent-buildable)

### Task 0.1: Branch + dependencies
**Files:** Modify `package.json`.
- [ ] `git checkout main && git checkout -b admin-cms`
- [ ] Run: `npm i @astrojs/vercel @supabase/supabase-js @supabase/ssr @astrojs/preact preact` and `npm i -D vitest`
- [ ] Verify: `node -e "require('@astrojs/vercel');require('@supabase/ssr')"` exits 0.
- [ ] Commit: `chore: add vercel, supabase, preact deps`.

### Task 0.2: Astro config → SSR on Vercel
**Files:** Modify `astro.config.mjs`.
- [ ] Replace contents:
```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import preact from '@astrojs/preact';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  site: 'https://huber-capital.co.il',
  output: 'server',
  adapter: vercel(),
  integrations: [tailwind(), preact()],
});
```
- [ ] Remove the `/huber-capital` base everywhere it’s referenced: in `src/components/Header.astro`, `Footer.astro`, `AboutGilad.astro`, `BaseLayout.astro`, `pages/investment.astro`, `thank-you.astro`, `404.astro`, the helper `const base = import.meta.env.BASE_URL...` resolves to `'/'` automatically once `base` is unset — leave the helpers (they yield `'/investment/'` etc. at base `/`). No code change needed beyond removing `base` from config. Verify by grep that no string literal `'/huber-capital'` remains in `src/`.
- [ ] Run: `npm run build` → Expected: builds with the Vercel adapter (output to `.vercel/output/`), 0 errors.
- [ ] Commit: `feat: switch Astro to SSR on Vercel adapter`.

### Task 0.3: Deploy on Vercel (client-assisted)
- [ ] **C2 (client):** In Vercel, “Add New Project” → import `haimgo/huber-capital` → Framework: Astro → deploy from branch `admin-cms` (Preview). Astro auto-detected.
- [ ] **Verify:** open the Vercel preview URL → the gold site renders identically (still reading `src/data/*.js`). This validates the hosting move before adding the DB.
- [ ] No commit (config only).

---

## Phase 1 — Supabase schema + seed

### Task 1.1: Schema SQL
**Files:** Create `supabase/schema.sql`.
- [ ] Write (full):
```sql
-- content tables
create table site_settings (
  id int primary key default 1,
  phone text, whatsapp text, location text,
  hero_eyebrow text, hero_title text, hero_sub text,
  manifesto_main text, manifesto_sub text,
  cta_title text, cta_sub text,
  constraint singleton check (id = 1)
);
create table stats (id bigint generated always as identity primary key, value text, label text, sort int default 0);
create table process_steps (id bigint generated always as identity primary key, n text, title text, "text" text, sort int default 0);
create table mistakes (id bigint generated always as identity primary key, n text, title text, "text" text, sort int default 0);
create table areas (id bigint generated always as identity primary key, name text, he text, blurb text, sort int default 0);
create table press (id bigint generated always as identity primary key, outlet text, title text, url text, sort int default 0);
create table page_sections (id bigint generated always as identity primary key, page text, slot text, value text, unique(page, slot));
create table news (id bigint generated always as identity primary key, title text, slug text unique, date date, excerpt text, body text, cover_url text, published boolean default false, created_at timestamptz default now());
create table admins (user_id uuid primary key references auth.users(id) on delete cascade, email text, created_at timestamptz default now());

-- helper: is the current user an admin?
create or replace function is_admin() returns boolean language sql security definer stable as $$
  select exists(select 1 from admins where user_id = auth.uid());
$$;

-- RLS
alter table site_settings enable row level security;
alter table stats enable row level security;
alter table process_steps enable row level security;
alter table mistakes enable row level security;
alter table areas enable row level security;
alter table press enable row level security;
alter table page_sections enable row level security;
alter table news enable row level security;
alter table admins enable row level security;

-- public read for content; admin write
do $$ declare t text;
begin
  foreach t in array array['site_settings','stats','process_steps','mistakes','areas','press','page_sections','news']
  loop
    execute format('create policy "public read" on %I for select using (true);', t);
    execute format('create policy "admin write" on %I for all using (is_admin()) with check (is_admin());', t);
  end loop;
end $$;

-- admins table: readable by admins only; writes via service role (API) bypass RLS
create policy "admins read own-club" on admins for select using (is_admin());

-- storage bucket
insert into storage.buckets (id, name, public) values ('media','media',true) on conflict do nothing;
create policy "media public read" on storage.objects for select using (bucket_id = 'media');
create policy "media admin write" on storage.objects for insert with check (bucket_id = 'media' and is_admin());
create policy "media admin update" on storage.objects for update using (bucket_id = 'media' and is_admin());
create policy "media admin delete" on storage.objects for delete using (bucket_id = 'media' and is_admin());
```
- [ ] Commit: `feat: supabase schema + RLS`.

### Task 1.2: Seed SQL (from current content)
**Files:** Create `supabase/seed.sql`.
- [ ] Translate current `src/data/content.js`, `areas.js`, `site.js`, and inline page text into `insert` statements (stats +17%/+122%/30/26; the 4 process steps; 3 mistakes; 5 areas; 3 press; site_settings row with phone `058-440-5858`, whatsapp `https://wa.link/7ogn9t`, hero/manifesto/cta text; page_sections for investment/process/projects/about copy). Full inserts written out (no placeholders).
- [ ] Commit: `feat: supabase seed from current content`.

### Task 1.3: Run schema + seed (client-assisted) + env
**Files:** Create `.env.example`; ensure `.env` in `.gitignore`.
- [ ] `.env.example`:
```
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
- [ ] **C1 (client):** In Supabase → SQL Editor → run `schema.sql` then `seed.sql`. Share `Project URL` + `anon` key. Add all three vars to a local `.env` (for agent build/test) and to **Vercel → Project → Settings → Environment Variables**.
- [ ] Verify: `grep -q "^.env$" .gitignore` and `test -f .env`.
- [ ] Commit: `chore: env example + gitignore` (no secrets committed).

---

## Phase 2 — Public data layer

### Task 2.1: Supabase clients
**Files:** Create `src/lib/supabase.ts`, `src/lib/types.ts`.
- [ ] `types.ts`: export interfaces `Settings, Stat, Step, Mistake, Area, Press, NewsItem`.
- [ ] `supabase.ts` (full):
```ts
import { createServerClient, createBrowserClient } from '@supabase/ssr';
const url = import.meta.env.PUBLIC_SUPABASE_URL;
const anon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
export function serverClient(cookies: AstroCookies) {
  return createServerClient(url, anon, {
    cookies: {
      get: (k) => cookies.get(k)?.value,
      set: (k, v, o) => cookies.set(k, v, o),
      remove: (k, o) => cookies.delete(k, o),
    },
  });
}
export function browserClient() { return createBrowserClient(url, anon); }
```
(import `AstroCookies` type from 'astro'.)
- [ ] Commit: `feat: supabase client factories`.

### Task 2.2: Content fetchers + unit test
**Files:** Create `src/lib/content.ts`, `tests/content.test.ts`.
- [ ] `content.ts`: `getSettings(sb)`, `getStats(sb)`, `getSteps(sb)`, `getMistakes(sb)`, `getAreas(sb)`, `getPress(sb)`, `getSection(sb,page,slot)`, `getNews(sb,{publishedOnly})` — each `select` ordered by `sort`/`date`, returning typed data, with try/catch returning `[]`/`null` on error (graceful fallback).
- [ ] Test (vitest) the mapper/fallback with a mocked client returning an error → returns `[]` not throw.
- [ ] Run: `npx vitest run tests/content.test.ts` → PASS.
- [ ] Commit: `feat: content data layer with safe fallbacks`.

### Task 2.3: Wire pages to Supabase
**Files:** Modify `src/pages/{index,investment,process,projects,about,press,contact}.astro`; `src/data/site.js` stays as fallback import for now.
- [ ] In each page frontmatter: `const sb = serverClient(Astro.cookies);` then fetch needed content and pass to components as props (components already accept props). Replace `import {stats...} from '../data/content.js'` usages.
- [ ] Run: `npm run build`; **verify with keys:** `npm run dev`, load each page → identical to the gold site, now DB-driven.
- [ ] Commit: `feat: public pages read content from Supabase`.

---

## Phase 3 — Auth + admin shell + admin management

### Task 3.1: Admin helper + middleware
**Files:** Create `src/lib/admin.ts`, `src/middleware.ts`.
- [ ] `admin.ts`: `async function isAdmin(sb): Promise<boolean>` → `getUser()`, if none return false; else `select count from admins where user_id=user.id` > 0.
- [ ] `middleware.ts`: for `context.url.pathname.startsWith('/admin')` and not `'/admin/login'`: build `serverClient`, if `!await isAdmin(sb)` → `return context.redirect('/admin/login')`. Else `next()`.
- [ ] Run: `npm run build`. Commit: `feat: admin auth guard middleware`.

### Task 3.2: Login + dashboard + shell
**Files:** `src/components/admin/AdminShell.astro`, `LoginForm.tsx`, `src/pages/admin/login.astro`, `src/pages/admin/index.astro`.
- [ ] `LoginForm.tsx` (Preact island, `client:load`): email+password → `browserClient().auth.signInWithPassword`; on success `location.href='/admin'`; show errors.
- [ ] `login.astro`: if already admin → redirect `/admin`; else render `<LoginForm client:load/>` (dark/gold themed).
- [ ] `AdminShell.astro`: sidebar/nav linking the admin sections + sign-out (calls `auth.signOut()` then redirect).
- [ ] `index.astro`: dashboard with links/counts.
- [ ] **Verify with keys:** add yourself to `admins` (seed or via Task 3.3), log in, reach dashboard; logged-out `/admin` redirects to login.
- [ ] Commit: `feat: admin login, dashboard, shell`.

### Task 3.3: Admin management + invite/remove API
**Files:** `src/pages/admin/admins.astro`, `src/components/admin/AdminsManager.tsx`, `src/pages/api/admins/invite.ts`, `src/pages/api/admins/remove.ts`.
- [ ] `invite.ts` (POST, server): build server client, **require `isAdmin`** (else 403). Then with a service-role client (`createClient(url, SERVICE_ROLE_KEY)`) call `auth.admin.inviteUserByEmail(email)`, insert into `admins(user_id,email)`. Return JSON.
- [ ] `remove.ts` (POST): require isAdmin; delete from `admins` by user_id (do not delete the auth user). Guard against removing the last admin.
- [ ] `AdminsManager.tsx`: list admins, invite-by-email form, remove button (calls the APIs).
- [ ] `admins.astro`: render manager.
- [ ] **Verify with keys:** invite a second email → it appears; new user gets a Supabase invite email; remove works; last-admin guard works.
- [ ] Commit: `feat: self-serve admin management (invite/remove)`.

---

## Phase 4 — Content editors

### Task 4.1: Generic ListEditor (covers all 5 lists, DRY)
**Files:** `src/components/admin/ListEditor.tsx`, `src/pages/admin/lists/[type].astro`.
- [ ] `ListEditor.tsx` (Preact): props `{ table, fields }` where `fields` describes columns per type. Loads rows via `browserClient().from(table).select().order('sort')`; supports add (insert), inline edit (update), delete, and reorder (update `sort`). RLS enforces admin.
- [ ] `[type].astro`: map `type` → `{table, fields}` config for `stats|process_steps|mistakes|areas|press`; render `<ListEditor client:load .../>`. 404 on unknown type.
- [ ] **Verify with keys:** edit a stat → save → it changes on the public page (after cache window/refresh).
- [ ] Commit: `feat: generic list editor for all data lists`.

### Task 4.2: Settings + page text editors
**Files:** `src/components/admin/SettingsForm.tsx`, `PagesForm.tsx`, `src/pages/admin/settings.astro`, `pages.astro`.
- [ ] `SettingsForm.tsx`: load `site_settings` row, edit fields, upsert.
- [ ] `PagesForm.tsx`: list `page_sections`, edit `value` per (page, slot), upsert.
- [ ] Render in the two pages.
- [ ] **Verify with keys:** change hero title / a paragraph → reflected publicly.
- [ ] Commit: `feat: settings and page-text editors`.

---

## Phase 5 — Media + news

### Task 5.1: Media manager
**Files:** `src/components/admin/MediaManager.tsx`, `src/pages/admin/media.astro`.
- [ ] Upload to `media` bucket (`storage.from('media').upload`), list files, copy public URL, delete. Used by news + (optionally) settings image fields.
- [ ] **Verify with keys:** upload an image → get public URL → renders.
- [ ] Commit: `feat: media upload manager`.

### Task 5.2: News CRUD
**Files:** `src/components/admin/NewsEditor.tsx`, `src/pages/admin/news/index.astro`, `news/[id].astro`; modify `src/pages/press.astro` (or a new `/news`) to show published items.
- [ ] List/create/edit/delete news; markdown body; `published` toggle; cover via MediaManager. Public press/news page lists `published` items via `getNews(sb,{publishedOnly:true})`.
- [ ] **Verify with keys:** publish an article → appears publicly; unpublished hidden.
- [ ] Commit: `feat: news CRUD + public listing`.

---

## Phase 6 — Polish & cutover

### Task 6.1: Caching + fallbacks + docs
**Files:** public pages (cache headers), `CLAUDE.md`, `.env.example`.
- [ ] Add `Astro.response.headers.set('Cache-Control','public, s-maxage=60, stale-while-revalidate=86400')` to public pages.
- [ ] Confirm content fetchers fail soft (already from Task 2.2).
- [ ] Update `CLAUDE.md`: Vercel/Supabase architecture, env vars, how to run schema/seed, admin URL, adding admins.
- [ ] Commit: `docs: admin architecture + caching`.

### Task 6.2: Cutover (client-assisted)
- [ ] Merge `admin-cms` → `main` (after review). Set Vercel Production Branch = `main`; promote to Production.
- [ ] Point the domain (`huber-capital.co.il` or keep vercel.app) at Vercel. Retire the GitHub Pages workflow (delete `.github/workflows/deploy.yml` or disable Pages).
- [ ] **Verify:** production URL serves the DB-driven gold site; `/admin` login works.
- [ ] Commit: `chore: retire GitHub Pages workflow (moved to Vercel)`.

---

## Self-Review

- **Spec coverage:** Vercel SSR (0.2) ✓; Supabase schema+RLS+storage (1.1) ✓; seed/migration (1.2, 2.3) ✓; data layer + fallbacks (2.x) ✓; auth + middleware (3.1–3.2) ✓; self-serve admin invite/remove via service-role (3.3) ✓; list/settings/page editors (4.x) ✓; media + news (5.x) ✓; caching/secrets/docs/cutover (6.x) ✓; env-var handling (1.3) ✓.
- **Placeholders:** Schema is complete SQL; the repetitive editors are unified into one config-driven `ListEditor` (no copy-paste); seed content (1.2) and per-type field configs (4.1) are specified to fill from the existing data files. Live-only checks are explicitly gated as "verify with keys," not omitted.
- **Consistency:** `is_admin()` (SQL) ↔ `isAdmin()` (TS) used consistently; table names match between schema, seed, content fetchers, and editors; `serverClient`/`browserClient` names consistent across tasks.
- **Dependency honesty:** C1–C3 (client account/keys) gate Phases 1–6 live verification; Phase 0 is fully agent-verifiable.
