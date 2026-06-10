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
- **תוכן ב-Supabase** (Postgres). שכבת נתונים: `src/lib/content.ts` (`getSettings/getStats/getSteps/getMistakes/getAreas/getPress/getNews/getSection/getSections`, fail-soft). טקסטים לעמודים: `src/lib/pageSections.ts` (קונפיג + ברירות-מחדל; override נשמר ב-`page_sections`). לקוחות: `src/lib/supabase.ts` (`serverClient`/`browserClient` דרך `@supabase/ssr`; מספק גם `WebSocket` בצד-שרת דרך `ws` ב-middleware, כי ל-Node<22 ב-Vercel אין WebSocket גלובלי ש-supabase-js דורש). `src/data/site.js` נשאר לפרטי קשר סטטיים (טלפון/וואטסאפ — לא נערכים בניהול).
- **אבטחה**: `src/middleware.ts` שומר על `/admin/*`, מוסיף cache לעמודים ציבוריים (ו-`private, no-store` ל-admin/api), ומחיל כותרות אבטחה על כל תגובה — CSP מחמיר (`script-src 'self'` בפרודקשן), anti-clickjacking ו-hardening — מ-`src/lib/security.ts` (`securityHeaders(isDev)`; בדיקות ב-`tests/security.test.ts`). **בהוספת סקריפט inline או משאב חיצוני (CDN/דומיין/fetch) — עדכן את ה-CSP ב-`src/lib/security.ts`, אחרת הדפדפן יחסום אותו.** RLS ב-Supabase (קריאה ציבורית, כתיבה למנהלים בלבד); `src/lib/admin.ts` (`isAdmin`).

## Design tokens (sci-fi / gold-neon) — שמור על אחידות
- צבעים (`tailwind.config.mjs`): `space #0b0a07` (רקע), `space2 #100d09`, `fg #f1ebdf` (טקסט), `mute #a59b86`, `cyan #ffd24a` (אקסנט זהב-נאון), `magenta #ff9d2f` (ענבר), `violet #d4a017`.
- מחלקות (`global.css`): `.glass`, `.neon` (גרדיאנט טקסט), `.glow`, `.eyebrow` (Orbitron uppercase), `.btn-neon`, `.input-glass`, `.reveal`.
- גופנים: **Space Grotesk** (`font-display`), **Heebo** (`font-body`), **Orbitron** (`font-mono`/eyebrows). מתארחים מקומית (**Fontsource**) דרך `@import` ב-`global.css` — לא Google Fonts CDN (שומר את ה-CSP ללא דומיינים חיצוניים; Heebo כולל subset עברי).
- RTL: `dir="rtl"`. שים לב — בתפריט העליון השתמש ב-`flex-row` רגיל (לא `flex-row-reverse`) כדי ש"בית" יופיע ראשון מימין.
- **אל תשנה ערכת צבעים/גופנים ללא בקשה מפורשת.**

## Content & admin (Supabase)
- טבלאות: `site_settings, stats, process_steps, mistakes, areas, press, page_sections, news, admins`. סכימה+RLS: `supabase/schema.sql`; seed: `supabase/seed.sql`. **קישורי רשתות חברתיות** (אייקוני פוטר: facebook/instagram/youtube/tiktok) נשמרים ב-`site_settings` בעמודות `social_*` — הרץ פעם אחת את `supabase/social.sql`; שדה ריק → האייקון מוסתר. הפוטר (`Footer.astro`) קורא אותם דרך `getSettings`.
- ממשק ניהול ב-`/admin` (Supabase Auth): דאשבורד (עם מוני תוכן + קישורי "צפייה באתר"), הגדרות (טקסטי הירו/CTA + תמונת גלעד + רשתות חברתיות), רשימות (`/admin/lists/[type]` — stats|process|mistakes|areas|press), טקסטים בעמודים (`/admin/pages` — כותרות/פסקאות/CTA לכל עמוד; נשמר ב-`page_sections`, ברירות-מחדל ב-`pageSections.ts`), חדשות, מדיה, מנהלים. תפריט נייד (hamburger) ב-`AdminLayout`; משוב שמירה אוטומטי + מצבי busy דרך `src/components/admin/ui.tsx` (`useStatus`/`Status`).
- **הוספת מנהלים**: `/admin/admins` → API שרת (`/api/admins/invite|remove`) עם `SUPABASE_SERVICE_ROLE_KEY` (שרת בלבד).
- עריכה משתקפת באתר תוך ~דקה (SSR + cache 60s ב-middleware).
- **Env** (Vercel + `.env` מקומי): `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (שרת בלבד; לא ב-git). ראה `.env.example`.

## Pages
ציבורי: `index, investment, process, projects, about, press, news` (+ `news/[slug]`), `contact` → `thank-you`, `legal/(privacy|terms|accessibility)`, `404`.
ניהול: `admin/(login, index, settings, lists/[type], pages, news, media, admins)`.

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
- **טקסטים בעמודים**: ברירות-מחדל מוגדרות ב-`src/lib/pageSections.ts`; העמוד קורא `getSections(sb,page)` ומשתמש ב-`pageText(sec,page,slot)` (מחזיר override מ-`page_sections` או ברירת-מחדל). הוספת טקסט נערך: הוסף שדה לקונפיג + השתמש ב-`pageText` בעמוד. שדה שזהה לברירת-המחדל אינו נשמר (חוזר אוטומטית לברירת-מחדל).
- העדף קומפוננטות/טוקנים קיימים (DRY). שמור RTL ועברית.

## דו-לשוני (i18n) — עברית + רוסית
- עברית (ברירת מחדל, RTL) בשורש; רוסית (LTR) תחת `/ru`. הרוסית מוגשת דרך `src/pages/ru/[...slug].astro` — route אמיתי (→ סטטוס 200 תקין ב-Vercel; rewrite טהור ב-middleware החזיר 404) שעושה `Astro.rewrite` לעמוד העברי המתאים. `src/middleware.ts` מציב `Astro.locals.lang` לפי הקידומת (סט אחד של עמודים לשתי השפות). `BaseLayout` קובע `lang`/`dir` + תגי hreflang/canonical.
- מנגנון: `src/lib/i18n.ts` — `t(lang,key)` (מחרוזות ממשק he/ru), `localizePath`/`stripLocale`, `byLang(row,field,lang)` (בוחר `field_ru` עם נפילה לעברית), `dirOf`. מתג שפה (HE·RU) ב-Header וב-Footer; כל הקישורים עוברים `localizePath`.
- **תוכן Supabase דו-לשוני**: עמודות `*_ru` בכל הטבלאות — הרץ פעם אחת את `supabase/i18n.sql` ב-Supabase. הניהול מציג שדה RU ליד כל שדה עברית; שדה RU ריק → נופל לעברית באתר.
- **כיוון**: השתמש במחלקות לוגיות — `text-start`/`text-end` ו-`rtl:flex-row-reverse` (לא `text-right`/`flex-row-reverse`) כדי שהפריסה תתהפך אוטומטית לפי `dir`.
- מחרוזות בקוד (ניווט/פוטר/כפתורים/ביוגרפיה/כותרות-משנה בבית) מתורגמות ב-`i18n.ts`; תוכן ה-CMS מתורגם בניהול. חריג: גוף עמודי `legal/*` עדיין בעברית (ממתין לתרגום משפטי).
