# Content TODO — confirm / replace before launch

Everything below is a placeholder, or content **inferred** from the live site (huber-capital.co.il).
Replace with verified content before going live.

## Must confirm (Gilad)
- [ ] **Business email** for leads → replace `REPLACE_ME` in `src/components/ContactForm.astro` with a real Formspree form id pointed at that inbox.
- [ ] **Process steps 02–04** (`src/data/content.js` → `process`): drafted from "בחירה · בדיקה · ביצוע". Confirm exact wording.
- [ ] **Press article URLs** (`src/data/content.js` → `press`): currently `#`. Add the real ynet / TheMarker / Mako links.
- [ ] **Market figures** (+17%, +122%, ~10%/yr, 200,000₪): carried verbatim from the live site. Confirm sourcing. A risk disclaimer is already in the footer (recommend legal review).
- [ ] **Investment advantages** (`src/pages/investment.astro`): general Dubai market points — confirm accuracy.
- [ ] **Area blurbs** (`src/data/areas.js`): short descriptions — confirm/expand.

## Legal (recommend a lawyer reviews)
- [ ] `src/pages/legal/{privacy,terms,accessibility}.astro` are reasonable Hebrew templates — review before relying on them.

## Images
- [ ] Replace placeholders per `ASSETS.md` (a real Gilad headshot especially).

## Already handled
- Dropped the template's fake figures ($2.4B / 380+) and the fake "A. Goldstein" testimonial — replaced with your real content.
