# Huber Capital — Website Rebuild (Émeraude) · Real-Content Edition

**Date:** 2026-06-04
**Status:** Design direction (Émeraude) + content adaptation approved. Awaiting final spec sign-off before planning.

## 1. Goal

Rebuild **huber-capital.co.il** as a premium, fast, deployable website for **Gilad Huber's (גלעד הובר) Dubai real-estate investment advisory** serving Israeli investors. Hebrew / RTL. Visual direction: **Émeraude** (deep emerald + gold, couture typography). The site is a **lead-generation funnel** (phone / WhatsApp / qualification-call form → thank-you page) — *not* a public property catalog.

## 2. Brand & real content (migrated from the live site)

- **Brand:** הובר קפיטל / Huber Capital — גלעד הובר.
- **Promise:** *"אני לא מוכר נכסים — אני בוחן השקעות"* · *"זו לא עוד עסקה — זה תהליך שמטרתו לייצר עבורך הצלחה"*
- **Offer:** *"השקעה בדובאי החל מ-200,000₪ הון עצמי"* · *"פוטנציאל עליית ערך של כ-10% בשנה"*
- **A-Z value props:** ליווי מלא A-Z · 26 פרויקטים נבחרים · צוות מקומי בדובאי · גישה למחיר מתחת לשוק.
- **Investor mistakes (problem):** עבודה מול יזם צעיר/לא יציב · בחירת פרויקט לא מדויק · הסתמכות על נתונים לא מדויקים.
- **Process:** "בחירה · בדיקה · ביצוע"; שלב 1 – שיחת אפיון (תקציב / מטרות / רמת סיכון).
- **About Gilad:** 30 שנות ניסיון בעולם העסקים; relocated his life to Dubai — *"ההחלטה הכי טובה שעשיתי"*.
- **Market data (client claims, to be sourced/disclaimed):** +17%/yr apartment prices (ynet) · +122% price per m² in USD · luxury-sales surge (TheMarker) · "golden opportunity for Israeli investors" (Mako).
- **Contact / funnel:** phone **058-440-5858** (`tel:0584405858`) · WhatsApp **wa.link/7ogn9t** · lead form → thank-you page. No public address / email / social currently.

## 3. Scope

**In:** full Émeraude redesign; Astro build with shared components; lead-gen funnel (phone/WhatsApp/form + thank-you); the pages in §6; press section; About Gilad; SEO; **accessibility statement**; deploy to GitHub Pages.
**Out:** public property listings/prices (consultation-driven); CMS; multi-language (layout leaves room for EN later); a real blog (external press links for now).

## 4. Architecture

- **Astro** (static output), file-based routing, pre-rendered pages from data.
- **Tailwind** via `@astrojs/tailwind`, Émeraude tokens in `tailwind.config.mjs`.
- No backend. Contact form → **Formspree** (§8). Host: **GitHub Pages** via GitHub Actions.

```
src/
  layouts/BaseLayout.astro
  components/ Header, Footer, Hero, StatBar, ValueProps, MistakeCards,
              ProcessSteps, AboutGilad, PressCards, CTA, ContactForm, SectionReveal
  pages/ index, investment, process, projects, about, press, contact, thank-you,
         legal/(privacy|terms|accessibility), 404
  data/ areas.js, press.js   (+ projects.js only if client supplies shareable projects)
  styles/global.css
public/assets/...
.github/workflows/deploy.yml
astro.config.mjs, tailwind.config.mjs, package.json
```

## 5. Design system — "Émeraude"

**Colors:** `emer` `#0e241d` (bg), `panel` `#123026`, deep `#0a1b13`; text `ivory` `#ece6da`, `mute` `#93a89d`; accent `gold` `#c8aa6e`; hairlines `rgba(236,230,218,.15)`.
**Type:** Cormorant Garamond (Latin display + numerals) · Frank Ruhl Libre (Hebrew display) · Assistant (body, 200–500). Eyebrows uppercase, tracking `.3–.5em`.
**Layout:** `max-w-[1280px]`, `px-8`, section `py-32`/`py-40`; right-aligned hero over emerald gradient (dark under text); gold as thin accent only (hairlines, rules, serif numerals, HC monogram).
**Motion:** slow fade-up reveals (respect `prefers-reduced-motion`); gentle image zoom on hover; optional muted full-screen video hero (client clip; image fallback).
**Accessibility:** ivory-on-emerald body (high contrast); verify gold text ≥ AA; focus states, skip-link, alt, RTL semantics.
Reference: `_mockups/lux-emeraude.html` (look) and `_mockups/realhome.html` (look + real content). `_mockups/` is reference; removed at parity.

## 6. Pages

| Page (he / route) | Content |
|---|---|
| **Home** `index` | Lead-gen: hero offer → opportunity + market data → "אני בוחן השקעות" → A-Z props → investor mistakes → process → About-Gilad teaser → press → CTA. |
| **השקעה בדובאי** `investment` | Thesis: why Dubai, return potential, market data, the 26-projects approach, risk framing. |
| **התהליך** `process` | A-Z: אפיון → בחירה → בדיקה → ביצוע; what the accompaniment includes. |
| **פרויקטים ואזורים** `projects` | Selected-projects *approach* + key Dubai investment areas (Palm Jumeirah, Downtown, Dubai Marina, Business Bay, JVC…). Consultation CTA. **No public listings/prices.** |
| **אודות / גלעד הובר** `about` | Story, 30 yrs, move to Dubai, philosophy, local Dubai team. |
| **בתקשורת** `press` | ynet / TheMarker / Mako coverage + future links. |
| **צור קשר** `contact` | Phone + WhatsApp first; qualification-call form → thank-you. |
| **תודה** `thank-you` | Post-submission page (mirrors current funnel). |
| **Legal** `legal/*` | Privacy, Terms, **Accessibility statement**. |
| **404** | Styled. |

## 7. Data model

- **`areas.js`** — `{ slug, name, blurb, image }` for the investment-areas section/page. No per-property listings.
- **`press.js`** — `{ outlet, title, url, date }`.
- **`projects.js`** — only if the client later supplies real, shareable projects; otherwise projects are described qualitatively. No fabricated listings/prices.

## 8. Contact & funnel

- Primary CTAs everywhere: phone `tel:0584405858`; WhatsApp `https://wa.link/7ogn9t` (header, hero, section ends, footer).
- **Qualification-call form** (שיחת אפיון): name, phone, email (optional), budget range, message → **Formspree** → client business email; on success show/redirect to **thank-you**. Honeypot anti-spam.

## 9. Content plan

- Use real copy verbatim where available; **mark inferred items** (e.g., process steps 2–4 drafted from "בחירה / בדיקה / ביצוע") in `CONTENT-TODO.md` for Gilad to confirm.
- **Drop** placeholder fakes carried from the template files ($2.4B, 380+, "A. Goldstein" testimonial).
- **Images:** `ASSETS.md` manifest; temporary placeholders (current localized images) until client supplies real photos (Gilad headshot, Dubai/projects, areas) + optional drone video.
- **Financial/marketing claims** (10%/yr, 200,000₪, +17%, +122%): carried verbatim as the client's own claims **plus a risk disclaimer** (e.g., *"אין באמור הבטחת תשואה; השקעה בנדל"ן בחו"ל כרוכה בסיכון"*). Recommend client/legal review.

## 10. SEO, accessibility & compliance

- Hebrew per-page `<title>`/description/OG; `sitemap.xml`; `robots.txt`; favicon/app icons; semantic headings; alt text.
- **Israeli accessibility** (תקנות נגישות): accessibility statement page + accessible markup (focus, contrast, skip-link, aria, keyboard).
- **Investment marketing:** risk disclaimer; no guaranteed-return language. Privacy note for form data.

## 11. Deployment

`astro.config.mjs` (`site`/`base`); `.github/workflows/deploy.yml` (`withastro/action` + `actions/deploy-pages`); Pages source = Actions. Client supplies GitHub repo; `git push` with client's account. Custom domain (e.g. point huber-capital.co.il) later.

## 12. Build phases (each leaves a runnable site)

0. **Scaffold** — Astro + Tailwind + Émeraude tokens + BaseLayout/Header/Footer + scroll-reveal; **Home with real content** (parity with `realhome.html`).
1. **Lead-gen plumbing** — phone/WhatsApp CTAs, Formspree qualification form, thank-you page; legal incl. accessibility statement + footer links.
2. **Content pages** — Investment, Process, Projects & Areas, About Gilad, In the Press.
3. **Polish + SEO + a11y** — meta, sitemap, robots, favicon, 404, accessibility pass.
4. **Assets** — `ASSETS.md` + localize images (swap when client provides real).
5. **Deploy** — GitHub Actions + Pages.

## 13. Inputs required from client

1. **Business email** for form leads.
2. **Confirm/expand:** the full A-Z process steps; any project/area specifics that may be public; sourcing + disclaimer wording for the market claims.
3. **Real photos** (Gilad headshot; Dubai / projects / areas) + optional hero video.
4. **GitHub repo**; optional **logo file**; physical address/email if any should be public.

## 14. Notes & risks

- **Build-step shift** (open-HTML → `npm`): more maintainable, better SEO; `CLAUDE.md` to be updated (it currently says "no build step").
- The live site is **WordPress**; we rebuild fresh in Astro — migrating *content*, not the WP theme.
- No fabricated listings, testimonials, or figures; everything traces to the client's real content or is flagged for confirmation.
