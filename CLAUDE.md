# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Huber Capital — אתר השקעות נדל"ן בדובאי (Astro)

אתר לידים/שיווק עבור **הובר קפיטל (גלעד הובר)** — ליווי משקיעים ישראלים בהשקעות נדל"ן בדובאי. עברית, RTL. נבנה ב-**Astro + Tailwind**, פלט סטטי, פריסה ל-**GitHub Pages**. שפת עיצוב: **"Émeraude"** (אמרלד כהה + זהב, יוקרתי-קוטיר).

## Commands
- `npm install` — התקנת תלויות.
- `npm run dev` — שרת פיתוח (http://localhost:4321).
- `npm run build` — בנייה סטטית ל-`dist/`.
- `npm run preview` — תצוגה מקדימה של הבנייה.
- תצוגה מהירה של הבנייה ללא Astro: `python3 -m http.server 8000 --directory dist` → http://localhost:8000

## Architecture
- **Astro** (פלט סטטי), ניתוב לפי קבצים ב-`src/pages/*.astro`.
- **פריסה משותפת** ב-`src/layouts/BaseLayout.astro`: `<html dir="rtl">`, head/meta/OG, גופנים, `Header`, `Footer`, סקריפט `.reveal` (IntersectionObserver) ותפריט מובייל. אין יותר שכפול header/footer בין דפים — אלו קומפוננטות.
- **Tailwind** דרך `@astrojs/tailwind`; טוקני Émeraude ב-`tailwind.config.mjs`. CSS גלובלי + ולידציה + focus ב-`src/styles/global.css`.
- **דאטה/תוכן** ב-`src/data/`: `site.js` (פרטי קשר/וואטסאפ), `content.js` (stats / mistakes / process / press), `areas.js` (אזורי השקעה). הדפים מרנדרים מהמערכים האלה — לערוך תוכן שם, לא ב-HTML.
- **קומפוננטות** ב-`src/components/`: `Hero, StatBar, MistakeCards, ProcessSteps, AboutGilad, PressCards, CTA, PageHeader, ContactForm, Header, Footer`.

## Design tokens (Émeraude) — שמור על אחידות
- צבעים: `emer #0e241d` (רקע), `panel #123026`, `deep #0a1b13`, `ivory #ece6da` (טקסט), `mute #93a89d`, `gold #c8aa6e` (אקסנט). hairlines דרך מחלקת `.hair` (`rgba(236,230,218,.15)`). תמונות: `.lux-img`.
- גופנים: **Cormorant Garamond** (`font-cormorant` — מספרים/לטינית), **Frank Ruhl Libre** (`font-head` — כותרות עברית), **Assistant** (`font-body`). Eyebrows: uppercase, letter-spacing רחב.
- כיווניות: כל המסמך `dir="rtl"`; ניווט `flex-row-reverse`.
- **אל תשנה את ערכת הצבעים/הגופנים ללא בקשה מפורשת.**

## Pages
בית (`index`), השקעה בדובאי (`investment`), התהליך (`process`), פרויקטים ואזורים (`projects`), אודות (`about`), בתקשורת (`press`), צור קשר (`contact`) → תודה (`thank-you`), משפטי (`legal/privacy|terms|accessibility`), `404`. דפים פנימיים משתמשים ב-`PageHeader`; הבית משתמש ב-`Hero` עם תמונה.

## Lead-gen / contact
- CTAs ראשיים בכל האתר: טלפון `tel:0584405858` ו-WhatsApp `https://wa.link/7ogn9t` (מוגדרים ב-`src/data/site.js`).
- `ContactForm.astro`: ולידציה בצד לקוח (name/phone/message + email ב-regex) + honeypot, שליחה ל-**Formspree** (יש להחליף `REPLACE_ME` ב-form id אמיתי) → הפניה ל-`/thank-you`.

## SEO / נגישות
- מטא/title/description/OG לכל דף דרך props של `BaseLayout`.
- `public/robots.txt` + `public/sitemap.xml` **סטטיים** — **עדכן את ה-sitemap בהוספת/הסרת דף**.
- הצהרת נגישות ב-`/legal/accessibility`; skip-link, `:focus-visible`, alt, aria, ניגודיות (זהב לטקסט גדול/אקסנט בלבד).

## Deploy
- `.github/workflows/deploy.yml` (GitHub Actions) בונה ופורס ל-GitHub Pages ב-push ל-`main`. ב-GitHub: Settings → Pages → Source: **GitHub Actions**.
- `site` ב-`astro.config.mjs` = `https://huber-capital.co.il`. לדומיין מותאם: השאר `base: '/'` והוסף `public/CNAME`. ל-project page (`<user>.github.io/<repo>`): הגדר `base: '/<repo>'`.

## מצב / TODO לפני העלאה
- ראה **`CONTENT-TODO.md`** (אימייל לטופס/Formspree, קישורי כתבות אמיתיים, אישור נתוני שוק ונוסח, בדיקת דפים משפטיים) ו-**`ASSETS.md`** (החלפת תמונות placeholder — בעיקר תמונת גלעד).
- האתר הישן (קבצי HTML סטטיים) הועבר ל-`_legacy/` כהפניה בלבד. מוקאפים של שלב העיצוב ב-`_mockups/` (מוחרגים מ-git).
- מסמכי תכנון: `docs/superpowers/specs/` ו-`docs/superpowers/plans/`.

## הנחיות עבודה
- בהוספת דף: צור `src/pages/<name>.astro` עם `BaseLayout` ו-`PageHeader`/קומפוננטות קיימות; הוסף לניווט ב-`src/components/Header.astro` וב-`Footer.astro`; **עדכן `public/sitemap.xml`**.
- העדף קומפוננטות וטוקנים קיימים (DRY) על פני שכפול. שמור RTL ועברית.
