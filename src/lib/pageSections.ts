// Single source of truth for editable per-page texts (the "טקסטים" admin section).
// Each field's `default` is the text shown on the public site when there is no
// override row in the page_sections table — so the site renders correctly even
// before anything is edited, and clearing a field reverts it to this default.

export type SectionField = { slot: string; label: string; default: string; type?: 'text' | 'textarea' };
export type PageSpec = { page: string; title: string; fields: SectionField[] };

export const PAGE_SECTIONS: PageSpec[] = [
  {
    page: 'about',
    title: 'אודות',
    fields: [
      { slot: 'header_eyebrow', label: 'כותרת עליונה (תווית)', default: 'ABOUT' },
      { slot: 'header_title', label: 'כותרת ראשית', default: 'גלעד הובר' },
      { slot: 'header_sub', label: 'תת-כותרת', default: '30 שנות ניסיון עסקי — ובית בדובאי.', type: 'textarea' },
      { slot: 'values_eyebrow', label: 'ערכים — תווית', default: 'הגישה שלנו' },
      { slot: 'values_heading', label: 'ערכים — כותרת', default: 'מה מנחה אותנו' },
      { slot: 'cta_title', label: 'קריאה לפעולה — כותרת', default: 'רוצים להכיר?' },
      { slot: 'cta_sub', label: 'קריאה לפעולה — תת-כותרת', default: 'נתחיל בשיחה קצרה ונראה אם אנחנו מתאימים לעבוד יחד.', type: 'textarea' },
    ],
  },
  {
    page: 'process',
    title: 'התהליך',
    fields: [
      { slot: 'header_eyebrow', label: 'כותרת עליונה (תווית)', default: 'THE PROCESS' },
      { slot: 'header_title', label: 'כותרת ראשית', default: 'מאפיון ועד ביצוע' },
      { slot: 'header_sub', label: 'תת-כותרת', default: 'תהליך מדויק שמתחיל ונגמר באינטרס שלכם — בחירה, בדיקה וביצוע.', type: 'textarea' },
      { slot: 'steps_eyebrow', label: 'שלבים — תווית', default: 'שישה שלבים' },
      { slot: 'steps_heading', label: 'שלבים — כותרת', default: 'איך זה עובד' },
      { slot: 'includes_eyebrow', label: 'מה כולל הליווי — תווית', default: 'הליווי המלא' },
      { slot: 'includes_heading', label: 'מה כולל הליווי — כותרת', default: 'מה כולל הליווי' },
      { slot: 'cta_title', label: 'קריאה לפעולה — כותרת', default: 'מוכנים להתחיל בשלב הראשון?' },
      { slot: 'cta_sub', label: 'קריאה לפעולה — תת-כותרת', default: 'שיחת אפיון ראשונית — נבין את התקציב, המטרות ורמת הסיכון.', type: 'textarea' },
    ],
  },
  {
    page: 'projects',
    title: 'פרויקטים ואזורים',
    fields: [
      { slot: 'header_eyebrow', label: 'כותרת עליונה (תווית)', default: 'PROJECTS // AREAS' },
      { slot: 'header_title', label: 'כותרת ראשית', default: 'פרויקטים נבחרים' },
      { slot: 'header_sub', label: 'תת-כותרת', default: '26 פרויקטים שנבחנו לעומק — גישה למחיר מתחת לשוק, דרך צוות מקומי בדובאי.', type: 'textarea' },
      { slot: 'note', label: 'הערה מתחת לכרטיסים', default: 'הרשימה המלאה והפרויקטים העדכניים נמסרים בשיחת אפיון אישית — בהתאמה לתקציב ולמטרות שלכם.', type: 'textarea' },
      { slot: 'areas_eyebrow', label: 'אזורים — תווית', default: 'אזורי השקעה' },
      { slot: 'areas_heading', label: 'אזורים — כותרת', default: 'אזורים מובילים בדובאי' },
      { slot: 'cta_title', label: 'קריאה לפעולה — כותרת', default: 'רוצים לראות את הפרויקטים המתאימים לכם?' },
      { slot: 'cta_sub', label: 'קריאה לפעולה — תת-כותרת', default: 'נשתף את הרשימה הרלוונטית בשיחת אפיון אישית.', type: 'textarea' },
    ],
  },
  {
    page: 'investment',
    title: 'השקעה בדובאי',
    fields: [
      { slot: 'header_eyebrow', label: 'כותרת עליונה (תווית)', default: 'השקעה בדובאי' },
      { slot: 'header_title', label: 'כותרת ראשית', default: 'למה דובאי?' },
      { slot: 'header_sub', label: 'תת-כותרת', default: 'אחד משוקי הנדל"ן הצומחים בעולם — עם יתרונות ייחודיים למשקיע הישראלי.', type: 'textarea' },
      { slot: 'intro_eyebrow', label: 'הזדמנות — תווית', default: 'ההזדמנות' },
      { slot: 'intro_heading', label: 'הזדמנות — כותרת', default: 'שוק בצמיחה, עם יתרונות אמיתיים' },
      { slot: 'intro_p1', label: 'הזדמנות — פסקה ראשונה', default: 'דובאי הפכה לאחד ממוקדי ההשקעה המבוקשים בעולם: אוכלוסייה צומחת, ביקוש עולה לשכירות, תשתיות ברמה עולמית וסביבת מיסוי אטרקטיבית למשקיעים.', type: 'textarea' },
      { slot: 'intro_p2', label: 'הזדמנות — פסקה שנייה', default: 'עבור המשקיע הישראלי, השוק מציע שילוב נדיר של פוטנציאל עליית ערך, תשואות שכירות ויציבות — בתנאי שנכנסים אליו עם הפרויקט הנכון, היזם הנכון והנתונים הנכונים.', type: 'textarea' },
      { slot: 'approach_eyebrow', label: 'הגישה — תווית', default: 'הגישה שלנו' },
      { slot: 'approach_heading', label: 'הגישה — כותרת', default: 'גישה ל-26 פרויקטים נבחרים' },
      { slot: 'approach_body', label: 'הגישה — פסקה', default: 'אנחנו לא עובדים מול "כל פרויקט". אנו בוחנים יזמים, מיקומים ונתונים — ומציעים גישה לפרויקטים נבחרים, לעיתים במחיר מתחת לשוק, דרך צוות מקומי בדובאי. כך מצמצמים סיכון וממקסמים פוטנציאל.', type: 'textarea' },
      { slot: 'cta_title', label: 'קריאה לפעולה — כותרת (אפשר <br/> לשבירת שורה)', default: 'רוצים לבחון אם דובאי<br/>מתאימה לכם?' },
      { slot: 'cta_sub', label: 'קריאה לפעולה — תת-כותרת', default: 'נתחיל בשיחת אפיון קצרה — ללא התחייבות.', type: 'textarea' },
    ],
  },
  {
    page: 'press',
    title: 'בתקשורת',
    fields: [
      { slot: 'header_eyebrow', label: 'כותרת עליונה (תווית)', default: 'בתקשורת' },
      { slot: 'header_title', label: 'כותרת ראשית', default: 'מדברים עלינו' },
      { slot: 'header_sub', label: 'תת-כותרת', default: 'שוק הנדל"ן בדובאי בכותרות.', type: 'textarea' },
      { slot: 'cta_title', label: 'קריאה לפעולה — כותרת', default: 'רוצים לדעת מה זה אומר עבורכם?' },
      { slot: 'cta_sub', label: 'קריאה לפעולה — תת-כותרת', default: 'נסביר בשיחת אפיון קצרה איך מגמות השוק מתורגמות להזדמנות.', type: 'textarea' },
    ],
  },
];

const DEFAULTS: Record<string, Record<string, string>> = {};
for (const p of PAGE_SECTIONS) {
  DEFAULTS[p.page] = {};
  for (const f of p.fields) DEFAULTS[p.page][f.slot] = f.default;
}

export function defaultText(page: string, slot: string): string {
  return DEFAULTS[page]?.[slot] ?? '';
}

/**
 * Effective text for a page slot in a language:
 * ru → Russian override, else Hebrew override, else the built-in Hebrew default.
 * (Russian falls back to Hebrew so the page is never empty before translation.)
 */
export function pageText(
  sec: Record<string, string>,
  page: string,
  slot: string,
  lang: 'he' | 'ru' = 'he'
): string {
  if (lang === 'ru') {
    const ru = sec?.[`${slot}_ru`];
    if (ru && ru.trim()) return ru;
  }
  const he = sec?.[slot];
  return he && he.trim() ? he : defaultText(page, slot);
}
