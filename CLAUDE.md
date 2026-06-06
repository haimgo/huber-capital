# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Huber Capital — אתר השקעות נדל"ן בדובאי (Astro + Supabase)

אתר לידים עבור **הובר קפיטל (גלעד הובר)** — ליווי משקיעים ישראלים בהשקעות נדל"ן בדובאי. עברית, RTL. **Astro (SSR) על Vercel**, תוכן מנוהל ב-**Supabase**, ממשק ניהול ב-`/admin`. שפת עיצוב: **sci-fi / נאון-זהב** — רקע חלל כהה + זהב-נאון, glassmorphism, ורקע חלקיקים (Three.js).

> הערה: הגרסה הקודמת (Émeraude, פלט סטטי ל-GitHub Pages) קיימת ב-branch `astro-rebuild`. ה-branch `admin-cms` הוא גרסת ה-Supabase/Vercel.

## Commands
- `npm install` — תלויות.
- `npm run dev` — שרת פיתוח SSR (http://localhost:4321). **קורא `.env`**.
- `npm run build` — בנייה לפלט Vercel (`.vercel/output/`).
- `npx vitest run` — בדיקות יחידה (שכבת הנתונים).
- דורש `.env` עם מפתחות Supabase (ראה `.env.example`).

## Architecture
- **Astro** `output: 'server'` + `@astrojs/vercel` (SSR). `@astrojs/preact` לאיים אינטראקטיביים בניהול.
- **פריסה משותפת**: `src/layouts/BaseLayout.astro` (head/meta/OG, גופנים, `Header`, `Footer`, `SpaceBackground` של חלקיקים, סקריפט `.reveal`). `AdminLayout.astro` לעמודי ניהול.
- **Tailwind** דרך `@astrojs/tailwind`; טוקנים ב-`tailwind.config.mjs`. glass/neon/reveal ב-`src/styles/global.css`.
- **תוכן ב-Supabase** (Postgres). שכבת נתונים: `src/lib/content.ts` (`getSettings/getStats/getSteps/getMistakes/getAreas/getPress/getNews/getSection`, fail-soft). לקוחות: `src/lib/supabase.ts` (`serverClient`/`browserClient` דרך `@supabase/ssr`). `src/data/site.js` נשאר לפרטי קשר סטטיים (טלפון/וואטסאפ — לא נערכים בניהול).
- **אבטחה**: `src/middleware.ts` שומר על `/admin/*` ומוסיף cache לעמודים ציבוריים; RLS ב-Supabase (קריאה ציבורית, כתיבה למנהלים בלבד); `src/lib/admin.ts` (`isAdmin`).

## Design tokens (sci-fi / gold-neon) — שמור על אחידות
- צבעים (`tailwind.config.mjs`): `space #0b0a07` (רקע), `space2 #100d09`, `fg #f1ebdf` (טקסט), `mute #a59b86`, `cyan #ffd24a` (אקסנט זהב-נאון), `magenta #ff9d2f` (ענבר), `violet #d4a017`.
- מחלקות (`global.css`): `.glass`, `.neon` (גרדיאנט טקסט), `.glow`, `.eyebrow` (Orbitron uppercase), `.btn-neon`, `.input-glass`, `.reveal`.
- גופנים: **Space Grotesk** (`font-display`), **Heebo** (`font-body`), **Orbitron** (`font-mono`/eyebrows).
- RTL: `dir="rtl"`. שים לב — בתפריט העליון השתמש ב-`flex-row` רגיל (לא `flex-row-reverse`) כדי ש"בית" יופיע ראשון מימין.
- **אל תשנה ערכת צבעים/גופנים ללא בקשה מפורשת.**

## Content & admin (Supabase)
- טבלאות: `site_settings, stats, process_steps, mistakes, areas, press, page_sections, news, admins`. סכימה+RLS: `supabase/schema.sql`; seed: `supabase/seed.sql`.
- ממשק ניהול ב-`/admin` (Supabase Auth): דאשבורד, הגדרות (טקסטי הירו/מנשר/CTA), רשימות (`/admin/lists/[type]` — stats|process|mistakes|areas|press), חדשות, מדיה, מנהלים.
- **הוספת מנהלים**: `/admin/admins` → API שרת (`/api/admins/invite|remove`) עם `SUPABASE_SERVICE_ROLE_KEY` (שרת בלבד).
- עריכה משתקפת באתר תוך ~דקה (SSR + cache 60s ב-middleware).
- **Env** (Vercel + `.env` מקומי): `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (שרת בלבד; לא ב-git). ראה `.env.example`.

## Pages
ציבורי: `index, investment, process, projects, about, press, news` (+ `news/[slug]`), `contact` → `thank-you`, `legal/(privacy|terms|accessibility)`, `404`.
ניהול: `admin/(login, index, settings, lists/[type], news, media, admins)`.

## Lead-gen / contact
- CTAs: `tel:0584405858`, WhatsApp `https://wa.link/7ogn9t` (`src/data/site.js`).
- `ContactForm.astro` → **Formspree** (החלף `REPLACE_ME`) → `/thank-you`.

## Deploy (Vercel)
- מחובר ל-GitHub repo (`haimgo/huber-capital`); Vercel בונה ופורס אוטומטית ב-push. הגדר את שלושת ה-env vars ב-Vercel → Settings → Environment Variables.
- (היסטורי) `.github/workflows/deploy.yml` פרס את הגרסה הסטטית ל-GitHub Pages.

## TODO לפני העלאה
- `CONTENT-TODO.md`, `ASSETS.md`. החלף `REPLACE_ME` ב-Formspree. הגדר `SUPABASE_SERVICE_ROLE_KEY` ב-Vercel כדי לאפשר הזמנת מנהלים.
- מסמכי תכנון: `docs/superpowers/specs|plans`.

## הנחיות עבודה
- **תוכן נערך ב-Supabase, לא בקוד.** בהוספת שדה תוכן: עדכן `schema.sql` + `content.ts` + הקומפוננטה + עורך הניהול.
- העדף קומפוננטות/טוקנים קיימים (DRY). שמור RTL ועברית.
