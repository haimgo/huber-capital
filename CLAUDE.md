# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Huber Capital Dubai — אתר נדל"ן יוקרה

אתר שיווקי סטטי (HTML + Tailwind CDN) לסוכנות נדל"ן יוקרה בדובאי. עברית, RTL. אין שלב build ואין מאגר git.

## Commands
זהו אתר סטטי ללא שלב build. להרצה מקומית:
- `python3 -m http.server 8000` — ואז פתח http://localhost:8000
- או כל שרת סטטי אחר (למשל `npx serve`)

## מבנה
חמישה עמודי HTML עצמאיים בשורש הפרויקט, מקושרים זה לזה בניווט:
- `index.html` — דף הבית (hero, נתונים, אודות, נכסים נבחרים, שירותים, המלצה, CTA)
- `properties.html` — קטלוג נכסים עם סינון בצד הלקוח (מיקום / מחיר / חדרים)
- `investments.html` — מידע על השקעות ומסלולים
- `advisory.html` — שירותי ייעוץ וציר תהליך
- `contact.html` — טופס יצירת קשר עם ולידציה בצד הלקוח

כל עמוד עצמאי לחלוטין: ה-`<head>` (כולל `tailwind.config`), ה-header, ה-`#mobile-menu`, ה-footer וה-`<script>` **משוכפלים בכל אחד מחמשת הקבצים**. כל שינוי גלובלי (פריט ניווט, צבע, לוגו) חייב להתבצע ידנית בכל חמשת הקבצים.

## נכסים וסינון (`properties.html`)
- הנתונים במערך `properties` בתוך תגית `<script>` בתחתית הקובץ. סכימה: `{ name, loc, price, beds, area, img }` — `price` ב**מיליוני** דולר (למשל `12.5`), ו-`img` מצביע על איבר במערך `IMG` שמעליו.
- הכרטיסים נבנים דינמית ע"י `card()` ו-`render()`; אין HTML סטטי לכרטיסים בעמוד זה.
- הסינון מצליב שלושה `<select>`: מיקום / טווח מחיר / מס' חדרים מינימלי. **ערכי `loc` במערך (Palm Jumeirah, Downtown Dubai, Emirates Hills, Dubai Marina, Jumeirah Bay) חייבים להתאים בדיוק לערכי ה-`<option>` בפילטר המיקום** — אחרת הסינון מחזיר 0 תוצאות בשקט.

## טופס יצירת קשר (`contact.html`)
- ולידציה בצד הלקוח על `name` / `email` / `message` (email נבדק ב-regex). שדה לא תקין מקבל `.border-error` ומציג את ה-`.error-msg` הסמוך לו.
- בהצלחה כל פקדי הטופס מוסתרים ומוצג `#success`. **אין שליחה לשום שרת** (ראה TODO).
- הצבע `error` (`#ba1a1a`) מוגדר ב-`tailwind.config` של עמוד זה **בלבד** — שאר העמודים לא צריכים אותו.

## מוסכמות עיצוב (Design Tokens)
מוגדרים ב-`tailwind.config` בתוך כל קובץ (Tailwind CDN, ללא קובץ build). שמור על אחידות בין הקבצים:
- צבע ראשי (זהב): `primary` = `#d4af37`
- רקע: `background` = `#FFFFFF`, משטחים בהירים: `surface-variant` = `#fdfbf7`
- כהה (להפרדה/CTA): `inverse-surface` = `#303031`
- פונט כותרות: Playfair Display (`font-display-lg`, `font-headline-lg`, `font-headline-md`)
- פונט גוף: Manrope (`font-body-md`, `font-label-md`, `font-label-sm`)
- כיווניות: כל המסמך `dir="rtl"`; ניווט משתמש ב-`flex-row-reverse`
- `darkMode: "class"` מוגדר, אך האתר נעול ל-light (`<html class="light">`) — אין כרגע מצב כהה בפועל.
- אנימציות גלילה: מחלקת `.reveal` + IntersectionObserver — קיימות רק ב-`index.html`, `advisory.html`, `investments.html`. ב-`contact.html` וב-`properties.html` ה-`<script>` עושה במקום זאת ולידציה / סינון (אין בהם `.reveal`).
- תפריט נייד: כפתור `#menu-btn` מחליף `hidden` על `#mobile-menu` (בכל חמשת העמודים).

## מצב נוכחי / TODO
- **טופס יצירת קשר**: עובד בצד הדפדפן בלבד (ולידציה + הודעת הצלחה). אינו שולח לשום מקום. צריך לחבר backend (Formspree / שרת / פונקציית serverless).
- **תמונות**: מקושרות לכתובות חיצוניות של Google (`lh3.googleusercontent.com`) — placeholders שעלולים להפסיק לעבוד. להחליף בקבצים מקומיים תחת תיקיית `assets/` לפני העלאה לאוויר.
- **קישורי פוטר** (מדיניות פרטיות / תנאי שימוש / נגישות): כרגע `href="#"`, ללא עמודים.
- הלוגו מקושר אף הוא לכתובת Google חיצונית.

## הנחיות עבודה
- בעת הוספת עמוד חדש: העתק את ה-header, ה-footer וה-`tailwind.config` מעמוד קיים כדי לשמור אחידות, והוסף את העמוד לניווט בכל חמשת הקבצים (header + `#mobile-menu` + footer).
- שים לב: ה-`tailwind.config` כבר אינו זהה ב-100% בין הקבצים (`contact.html` מוסיף `error`). העתק מעמוד שמכיל את מה שדרוש לך.
- שמור על RTL ועל טקסט בעברית.
- אל תחליף את ערכת הצבעים או הפונטים ללא בקשה מפורשת.
