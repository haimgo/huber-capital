# Huber Capital — Astro Rebuild Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Rebuild huber-capital.co.il as a fast, deployable Astro site in the Émeraude design, using the real content (Gilad Huber · Dubai investment advisory) migrated from the live site.

**Architecture:** Astro static site, Tailwind (v3 via `@astrojs/tailwind`) with Émeraude design tokens, shared layout + components (no copy-paste), content/data in JS + Markdown, deployed to GitHub Pages via Actions.

**Tech Stack:** Astro 4, `@astrojs/tailwind` + Tailwind 3, `@astrojs/sitemap`, Google Fonts (Cormorant Garamond, Frank Ruhl Libre, Assistant), Formspree (contact), GitHub Pages.

**Verification approach (domain-adapted):** This is a static marketing site, not an app with unit logic. "Tests" = (a) `npm run build` succeeds with zero errors, (b) full-page **screenshot review** via headless Chrome (the workflow already used in design), (c) link/anchor checks and an a11y pass in the polish phase. Each task ends with build + visual verification + commit.

**Reference assets:** Approved look + real content already exist as static mockups in `_mockups/lux-emeraude.html` (design) and `_mockups/realhome.html` (home with real content) — these are ported into Astro components, not rebuilt from scratch. Localized images are in `_mockups/img/`. Full requirements in `docs/superpowers/specs/2026-06-04-huber-capital-luxury-redesign-design.md`.

---

## File Structure

```
package.json, astro.config.mjs, tailwind.config.mjs, tsconfig.json, .gitignore
src/
  styles/global.css                 # fonts import, base, .reveal motion, RTL
  layouts/BaseLayout.astro          # <html dir=rtl>, <head> meta/OG, fonts, Header, <slot/>, Footer, reveal script
  components/
    Header.astro                    # utility bar + nav + monogram + WhatsApp CTA + mobile menu
    Footer.astro                    # monogram, nav, contact, legal links, risk disclaimer
    Hero.astro                      # props: eyebrow, title, sub, image, CTAs
    StatBar.astro                   # props: stats[]
    ValueProps.astro / MistakeCards.astro / ProcessSteps.astro
    AboutGilad.astro, PressCards.astro, CTA.astro, ContactForm.astro, SectionReveal.astro
  data/ areas.js, press.js, stats.js, process.js, mistakes.js
  pages/
    index.astro, investment.astro, process.astro, projects.astro,
    about.astro, press.astro, contact.astro, thank-you.astro,
    legal/privacy.astro, legal/terms.astro, legal/accessibility.astro, 404.astro
public/assets/{hero,about,areas,press,og}/...   # from _mockups/img + ASSETS.md
.github/workflows/deploy.yml
_legacy/                            # archived original *.html (reference)
ASSETS.md, CONTENT-TODO.md
```

---

## Phase 0 — Foundation + Home

### Task 0.1: Repo + project scaffold
**Files:** Create `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`; move old HTML to `_legacy/`.
- [ ] `git init`; archive `index.html properties.html investments.html advisory.html contact.html` into `_legacy/`.
- [ ] Write `.gitignore` (`node_modules/`, `dist/`, `.astro/`, `.DS_Store`).
- [ ] Write minimal `package.json` (scripts: dev/build/preview/astro) with deps `astro@^4.16`, `@astrojs/tailwind@^5.1`, `tailwindcss@^3.4`, `@astrojs/sitemap@^3.2`.
- [ ] Write `astro.config.mjs` with tailwind() + sitemap(), `site` placeholder, `output: 'static'`.
- [ ] Run: `npm install` → Expected: completes, `node_modules/` present.
- [ ] Run: `npm run build` on an empty `src/pages/index.astro` ("hello") → Expected: build succeeds.
- [ ] Commit: `chore: scaffold Astro project, archive legacy HTML`.

### Task 0.2: Émeraude tokens + global styles
**Files:** Create `tailwind.config.mjs`, `src/styles/global.css`.
- [ ] `tailwind.config.mjs`: colors `emer #0e241d, panel #123026, deep #0a1b13, ivory #ece6da, mute #93a89d, gold #c8aa6e`; fontFamily `cormorant, head (Frank Ruhl Libre), body (Assistant)`; content globs for `./src/**/*.{astro,html,js,ts}`.
- [ ] `global.css`: Google Fonts @import (Cormorant Garamond, Frank Ruhl Libre, Assistant); `body{background:#0e241d}`; `.hair{border-color:rgba(236,230,218,.15)}`; `.lux-img{filter:...}`; `.reveal`/`.reveal.in` fade-up with `@media (prefers-reduced-motion)` guard.
- [ ] Verify by using a token class in index and `npm run build`. Commit: `feat: add Émeraude design tokens and global styles`.

### Task 0.3: BaseLayout + Header + Footer
**Files:** Create `src/layouts/BaseLayout.astro`, `src/components/Header.astro`, `src/components/Footer.astro`.
- [ ] `BaseLayout`: `<html lang="he" dir="rtl">`, `<head>` with title/description props, OG tags, fonts, global.css; renders `<Header/>`, `<slot/>`, `<Footer/>`; includes the IntersectionObserver reveal `<script>` and a mobile-menu toggle script.
- [ ] `Header`: utility bar (058-440-5858 · WhatsApp `https://wa.link/7ogn9t` · עברית), monogram HC + wordmark, nav (בית · השקעה בדובאי · התהליך · פרויקטים · אודות · בתקשורת · צור קשר), "שיחת ייעוץ" CTA, mobile menu. Port markup/classes from `_mockups/realhome.html` header.
- [ ] `Footer`: monogram, nav column, contact (phone/WhatsApp), legal links (פרטיות/תקנון/נגישות), risk disclaimer. Port from `realhome.html` footer.
- [ ] Build; screenshot a page using the layout. Commit: `feat: BaseLayout with shared Header and Footer`.

### Task 0.4: Home components + page
**Files:** Create `src/components/{Hero,StatBar,MistakeCards,ProcessSteps,AboutGilad,PressCards,CTA,SectionReveal}.astro`, `src/data/{stats,mistakes,process,press}.js`; create `src/pages/index.astro`.
- [ ] Extract data arrays from `realhome.html` into `src/data/*.js` (stats, mistakes, process steps, press items).
- [ ] Build each component porting the exact Émeraude markup/classes from `realhome.html`, wrapping scroll sections in `SectionReveal`.
- [ ] `index.astro`: compose BaseLayout + Hero + Manifesto + StatBar + MistakeCards + ProcessSteps + AboutGilad + PressCards + CTA, using real content.
- [ ] Copy `_mockups/img/{hero,about}.jpg` → `public/assets/`.
- [ ] Run `npm run build`; screenshot `dist` home full-page; compare to `realhome.html`. Expected: visual parity.
- [ ] Commit: `feat: home page in Émeraude with real content`.

---

## Phase 1 — Lead-gen plumbing + legal

### Task 1.1: Contact form + thank-you
**Files:** `src/components/ContactForm.astro`, `src/pages/contact.astro`, `src/pages/thank-you.astro`.
- [ ] `ContactForm`: fields name, phone, email (optional), budget (select), message; client-side validation (`.border-error`, `.error-msg`); honeypot; POST to Formspree placeholder `https://formspree.io/f/REPLACE_ME` via fetch; on success redirect to `/thank-you`.
- [ ] `contact.astro`: phone (`tel:0584405858`) + WhatsApp blocks prominent above the form, then the form. `thank-you.astro`: confirmation + return link.
- [ ] Build; screenshot both; submit-validation manual check. Commit: `feat: contact form (Formspree) + thank-you page`.

### Task 1.2: Legal pages + footer links
**Files:** `src/pages/legal/{privacy,terms,accessibility}.astro`.
- [ ] Create three pages with the shared layout and placeholder Hebrew legal text (accessibility statement per Israeli תקנות נגישות); wire Footer links to them.
- [ ] Build; check the 3 routes render and footer links resolve. Commit: `feat: legal pages (privacy, terms, accessibility) + footer links`.

---

## Phase 2 — Content pages

### Task 2.1: Investment (השקעה בדובאי)
**Files:** `src/pages/investment.astro`, `src/data/stats.js` (reuse).
- [ ] Build the investment-thesis page (why Dubai, return potential, market data, 26-projects approach, risk framing) using Émeraude sections + StatBar + CTA. Content from spec §2; mark inferred copy in CONTENT-TODO.
- [ ] Build + screenshot. Commit: `feat: investment page`.

### Task 2.2: Process (התהליך)
**Files:** `src/pages/process.astro`.
- [ ] Detailed A-Z process (אפיון → בחירה → בדיקה → ביצוע) reusing ProcessSteps, expanded; CTA. Mark steps 2–4 as draft in CONTENT-TODO.
- [ ] Build + screenshot. Commit: `feat: process page`.

### Task 2.3: Projects & Areas (פרויקטים ואזורים)
**Files:** `src/pages/projects.astro`, `src/data/areas.js`.
- [ ] `areas.js`: 5 Dubai areas `{slug,name,blurb,image}` (Palm Jumeirah, Downtown, Dubai Marina, Business Bay, JVC). Page = selected-projects approach (no public listings) + areas grid + consultation CTA.
- [ ] Build + screenshot. Commit: `feat: projects & investment-areas page`.

### Task 2.4: About Gilad (אודות)
**Files:** `src/pages/about.astro`.
- [ ] Gilad's story (30 yrs, move to Dubai, philosophy), local-team note, reuse AboutGilad + CTA.
- [ ] Build + screenshot. Commit: `feat: about page`.

### Task 2.5: Press (בתקשורת)
**Files:** `src/pages/press.astro`, `src/data/press.js`.
- [ ] `press.js`: ynet/TheMarker/Mako `{outlet,title,url,date}` (URLs flagged in CONTENT-TODO). Page = PressCards grid.
- [ ] Build + screenshot. Commit: `feat: press page`.

---

## Phase 3 — Polish, SEO, a11y

### Task 3.1: Meta/SEO + 404 + sitemap/robots
- [ ] Per-page `<title>`/description/OG via BaseLayout props; `@astrojs/sitemap` configured; `public/robots.txt`; favicon/app icons; styled `src/pages/404.astro`.
- [ ] Build; confirm `dist/sitemap-index.xml` and per-page titles. Commit: `feat: SEO meta, sitemap, robots, favicon, 404`.

### Task 3.2: Accessibility + responsive pass
- [ ] Skip-link, focus-visible styles, alt text, aria on nav/menu, color-contrast check (gold-on-emerald for large text only); test mobile breakpoints via resized screenshots.
- [ ] Commit: `fix: accessibility and responsive refinements`.

---

## Phase 4 — Assets

### Task 4.1: Asset manifest + localization
**Files:** `ASSETS.md`, `CONTENT-TODO.md`, `public/assets/*`.
- [ ] `ASSETS.md`: every required image (path, purpose, dimensions). `CONTENT-TODO.md`: all placeholder copy + flagged items (process steps 2–4, press URLs, market-claim sourcing, business email, Gilad headshot).
- [ ] Place current localized images as temp placeholders. Commit: `docs: asset manifest + content TODO; add placeholder images`.

---

## Phase 5 — Deploy + docs

### Task 5.1: GitHub Pages CI
**Files:** `.github/workflows/deploy.yml`, `astro.config.mjs` (site/base).
- [ ] Add `withastro/action` + `actions/deploy-pages` workflow; set `site`/`base` (depends on client repo name). Document enabling Pages (source: Actions) and the `git push` steps for the client.
- [ ] Commit: `ci: GitHub Pages deploy workflow`.

### Task 5.2: Update CLAUDE.md
- [ ] Rewrite `CLAUDE.md` for the Astro architecture (commands `npm install`/`npm run dev`/`npm run build`; structure; Émeraude tokens; data-driven pages; deploy). Remove the "no build step" guidance.
- [ ] Commit: `docs: update CLAUDE.md for Astro architecture`.

---

## Self-Review

- **Spec coverage:** Émeraude system (0.2–0.3) ✓; lead-gen funnel + phone/WhatsApp (0.3,0.4,1.1) ✓; all pages incl. Projects&Areas, Press, About-Gilad, legal, thank-you (0.4,1.x,2.x) ✓; Formspree (1.1) ✓; SEO+a11y+compliance (3.x) ✓; assets/content TODO (4.1) ✓; deploy + CLAUDE.md (5.x) ✓.
- **Placeholders:** Page-markup is ported from approved mockups rather than reproduced here (intentional for a content site); data arrays and acceptance checks are concrete. Financial claims carried verbatim + disclaimer; inferred copy tracked in CONTENT-TODO.
- **Consistency:** Component/token names match the mockups (`emer/gold/ivory`, `hair`, `lux-img`, `font-head/cormorant/body`). Data file names referenced consistently across tasks.
