// Single source of truth for editable per-page texts (the "טקסטים" admin section).
// `default` is the Hebrew text; `default_ru` the Russian. The site shows the DB
// override if present, else these defaults (so it renders correctly + translated
// before anything is edited). English eyebrows (ABOUT, THE PROCESS…) intentionally
// have no default_ru — they stay Latin in both languages.

export type SectionField = { slot: string; label: string; default: string; default_ru?: string; type?: 'text' | 'textarea' };
export type PageSpec = { page: string; title: string; fields: SectionField[] };

export const PAGE_SECTIONS: PageSpec[] = [
  {
    page: 'home',
    title: 'בית — מנשר ובאנר',
    fields: [
      { slot: 'manifesto_extra', label: 'מנשר — שורה נוספת', default: 'מלווה אנשים לקבל החלטה נכונה. אני פועל רק במקומות שבהם אני מאמין ולא ממליץ על עסקה שלא הייתי מבצע בעצמי.', default_ru: 'Я сопровождаю людей к правильному решению. Я работаю только там, где сам верю, и не рекомендую сделку, которую не совершил бы сам.', type: 'textarea' },
      { slot: 'approach_title', label: 'כותרת', default: 'הגישה שלי פשוטה', default_ru: 'Мой подход прост' },
      { slot: 'approach_line1', label: 'שורה ראשונה', default: 'אני לא מוכר נכסים', default_ru: 'Я не продаю недвижимость' },
      { slot: 'approach_line2', label: 'שורה שנייה (מודגשת)', default: 'אני בוחן השקעות', default_ru: 'Я анализирую инвестиции' },
      { slot: 'approach_body', label: 'טקסט', default: 'מלווה אנשים לקבל החלטה נכונה. אני פועל רק במקומות שבהם אני מאמין ולא ממליץ על עסקה שלא הייתי מבצע בעצמי.', default_ru: 'Я сопровождаю людей к правильному решению. Я работаю только там, где сам верю, и не рекомендую сделку, которую не совершил бы сам.', type: 'textarea' },
    ],
  },
  {
    page: 'about',
    title: 'אודות',
    fields: [
      { slot: 'header_eyebrow', label: 'כותרת עליונה (תווית)', default: 'ABOUT' },
      { slot: 'header_title', label: 'כותרת ראשית', default: 'גלעד הובר', default_ru: 'Гилад Хубер' },
      { slot: 'header_sub', label: 'תת-כותרת', default: '30 שנות ניסיון עסקי — ובית בדובאי.', default_ru: '30 лет делового опыта — и дом в Дубае.', type: 'textarea' },
      { slot: 'values_eyebrow', label: 'ערכים — תווית', default: 'הגישה שלנו', default_ru: 'Наш подход' },
      { slot: 'values_heading', label: 'ערכים — כותרת', default: 'מה מנחה אותנו', default_ru: 'Что нами движет' },
      { slot: 'cta_title', label: 'קריאה לפעולה — כותרת', default: 'רוצים להכיר?', default_ru: 'Хотите познакомиться?' },
      { slot: 'cta_sub', label: 'קריאה לפעולה — תת-כותרת', default: 'נתחיל בשיחה קצרה ונראה אם אנחנו מתאימים לעבוד יחד.', default_ru: 'Начнём с короткого разговора и поймём, подходим ли мы друг другу.', type: 'textarea' },
    ],
  },
  {
    page: 'process',
    title: 'התהליך',
    fields: [
      { slot: 'header_eyebrow', label: 'כותרת עליונה (תווית)', default: 'THE PROCESS' },
      { slot: 'header_title', label: 'כותרת ראשית', default: 'מאפיון ועד ביצוע', default_ru: 'От анализа до сделки' },
      { slot: 'header_sub', label: 'תת-כותרת', default: 'תהליך מדויק שמתחיל ונגמר באינטרס שלכם — בחירה, בדיקה וביצוע.', default_ru: 'Выверенный процесс, который начинается и заканчивается вашими интересами — выбор, проверка и реализация.', type: 'textarea' },
      { slot: 'steps_eyebrow', label: 'שלבים — תווית', default: 'שישה שלבים', default_ru: 'Шесть шагов' },
      { slot: 'steps_heading', label: 'שלבים — כותרת', default: 'איך זה עובד', default_ru: 'Как это работает' },
      { slot: 'includes_eyebrow', label: 'מה כולל הליווי — תווית', default: 'הליווי המלא', default_ru: 'Полное сопровождение' },
      { slot: 'includes_heading', label: 'מה כולל הליווי — כותרת', default: 'מה כולל הליווי', default_ru: 'Что входит в сопровождение' },
      { slot: 'cta_title', label: 'קריאה לפעולה — כותרת', default: 'מוכנים להתחיל בשלב הראשון?', default_ru: 'Готовы начать с первого шага?' },
      { slot: 'cta_sub', label: 'קריאה לפעולה — תת-כותרת', default: 'שיחת אפיון ראשונית — נבין את התקציב, המטרות ורמת הסיכון.', default_ru: 'Первичная консультация — определим бюджет, цели и уровень риска.', type: 'textarea' },
    ],
  },
  {
    page: 'projects',
    title: 'פרויקטים ואזורים',
    fields: [
      { slot: 'header_eyebrow', label: 'כותרת עליונה (תווית)', default: 'PROJECTS // AREAS' },
      { slot: 'header_title', label: 'כותרת ראשית', default: 'פרויקטים נבחרים', default_ru: 'Избранные проекты' },
      { slot: 'header_sub', label: 'תת-כותרת', default: '26 פרויקטים שנבחנו לעומק — גישה למחיר מתחת לשוק, דרך צוות מקומי בדובאי.', default_ru: '26 тщательно отобранных проектов — доступ к ценам ниже рынка через локальную команду в Дубае.', type: 'textarea' },
      { slot: 'note', label: 'הערה מתחת לכרטיסים', default: 'הרשימה המלאה והפרויקטים העדכניים נמסרים בשיחת אפיון אישית — בהתאמה לתקציב ולמטרות שלכם.', default_ru: 'Полный и актуальный список проектов мы предоставляем на личной консультации — с учётом вашего бюджета и целей.', type: 'textarea' },
      { slot: 'areas_eyebrow', label: 'אזורים — תווית', default: 'אזורי השקעה', default_ru: 'Районы для инвестиций' },
      { slot: 'areas_heading', label: 'אזורים — כותרת', default: 'אזורים מובילים בדובאי', default_ru: 'Ведущие районы Дубая' },
      { slot: 'cta_title', label: 'קריאה לפעולה — כותרת', default: 'רוצים לראות את הפרויקטים המתאימים לכם?', default_ru: 'Хотите увидеть подходящие вам проекты?' },
      { slot: 'cta_sub', label: 'קריאה לפעולה — תת-כותרת', default: 'נשתף את הרשימה הרלוונטית בשיחת אפיון אישית.', default_ru: 'Поделимся релевантным списком на личной консультации.', type: 'textarea' },
    ],
  },
  {
    page: 'investment',
    title: 'השקעה בדובאי',
    fields: [
      { slot: 'header_eyebrow', label: 'כותרת עליונה (תווית)', default: 'השקעה בדובאי', default_ru: 'Инвестиции в Дубае' },
      { slot: 'header_title', label: 'כותרת ראשית', default: 'למה דובאי?', default_ru: 'Почему Дубай?' },
      { slot: 'header_sub', label: 'תת-כותרת', default: 'אחד משוקי הנדל"ן הצומחים בעולם — עם יתרונות ייחודיים למשקיע הישראלי.', default_ru: 'Один из самых быстрорастущих рынков недвижимости в мире — с уникальными преимуществами для инвестора.', type: 'textarea' },
      { slot: 'intro_eyebrow', label: 'הזדמנות — תווית', default: 'ההזדמנות', default_ru: 'Возможность' },
      { slot: 'intro_heading', label: 'הזדמנות — כותרת', default: 'שוק בצמיחה, עם יתרונות אמיתיים', default_ru: 'Растущий рынок с реальными преимуществами' },
      { slot: 'intro_p1', label: 'הזדמנות — פסקה ראשונה', default: 'דובאי הפכה לאחד ממוקדי ההשקעה המבוקשים בעולם: אוכלוסייה צומחת, ביקוש עולה לשכירות, תשתיות ברמה עולמית וסביבת מיסוי אטרקטיבית למשקיעים.', default_ru: 'Дубай стал одним из самых востребованных центров инвестиций в мире: растущее население, повышенный спрос на аренду, инфраструктура мирового уровня и привлекательная налоговая среда для инвесторов.', type: 'textarea' },
      { slot: 'intro_p2', label: 'הזדמנות — פסקה שנייה', default: 'עבור המשקיע הישראלי, השוק מציע שילוב נדיר של פוטנציאל עליית ערך, תשואות שכירות ויציבות — בתנאי שנכנסים אליו עם הפרויקט הנכון, היזם הנכון והנתונים הנכונים.', default_ru: 'Для инвестора рынок предлагает редкое сочетание потенциала роста стоимости, арендной доходности и стабильности — при условии входа с правильным проектом, правильным застройщиком и правильными данными.', type: 'textarea' },
      { slot: 'approach_eyebrow', label: 'הגישה — תווית', default: 'הגישה שלנו', default_ru: 'Наш подход' },
      { slot: 'approach_heading', label: 'הגישה — כותרת', default: 'גישה ל-26 פרויקטים נבחרים', default_ru: 'Доступ к 26 отобранным проектам' },
      { slot: 'approach_body', label: 'הגישה — פסקה', default: 'אנחנו לא עובדים מול "כל פרויקט". אנו בוחנים יזמים, מיקומים ונתונים — ומציעים גישה לפרויקטים נבחרים, לעיתים במחיר מתחת לשוק, דרך צוות מקומי בדובאי. כך מצמצמים סיכון וממקסמים פוטנציאל.', default_ru: 'Мы не работаем с «любым проектом». Мы анализируем застройщиков, локации и данные — и предлагаем доступ к отобранным проектам, иногда по цене ниже рынка, через локальную команду в Дубае. Так мы снижаем риск и максимизируем потенциал.', type: 'textarea' },
      { slot: 'cta_title', label: 'קריאה לפעולה — כותרת (אפשר <br/> לשבירת שורה)', default: 'רוצים לבחון אם דובאי<br/>מתאימה לכם?', default_ru: 'Хотите проверить,<br/>подходит ли вам Дубай?' },
      { slot: 'cta_sub', label: 'קריאה לפעולה — תת-כותרת', default: 'נתחיל בשיחת אפיון קצרה — ללא התחייבות.', default_ru: 'Начнём с короткой консультации — без обязательств.', type: 'textarea' },
    ],
  },
  {
    page: 'press',
    title: 'בתקשורת',
    fields: [
      { slot: 'header_eyebrow', label: 'כותרת עליונה (תווית)', default: 'בתקשורת', default_ru: 'СМИ' },
      { slot: 'header_title', label: 'כותרת ראשית', default: 'מדברים עלינו', default_ru: 'О нас говорят' },
      { slot: 'header_sub', label: 'תת-כותרת', default: 'שוק הנדל"ן בדובאי בכותרות.', default_ru: 'Рынок недвижимости Дубая в заголовках.', type: 'textarea' },
      { slot: 'cta_title', label: 'קריאה לפעולה — כותרת', default: 'רוצים לדעת מה זה אומר עבורכם?', default_ru: 'Хотите узнать, что это значит для вас?' },
      { slot: 'cta_sub', label: 'קריאה לפעולה — תת-כותרת', default: 'נסביר בשיחת אפיון קצרה איך מגמות השוק מתורגמות להזדמנות.', default_ru: 'На короткой консультации объясним, как рыночные тренды превращаются в возможность.', type: 'textarea' },
    ],
  },
];

const DEFAULTS: Record<string, Record<string, string>> = {};
const DEFAULTS_RU: Record<string, Record<string, string>> = {};
for (const p of PAGE_SECTIONS) {
  DEFAULTS[p.page] = {};
  DEFAULTS_RU[p.page] = {};
  for (const f of p.fields) {
    DEFAULTS[p.page][f.slot] = f.default;
    if (f.default_ru) DEFAULTS_RU[p.page][f.slot] = f.default_ru;
  }
}

export function defaultText(page: string, slot: string): string {
  return DEFAULTS[page]?.[slot] ?? '';
}

/**
 * Effective text for a page slot in a language:
 * ru → Russian override (DB) → Russian default → Hebrew override → Hebrew default.
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
    const dru = DEFAULTS_RU[page]?.[slot];
    if (dru && dru.trim()) return dru;
  }
  const he = sec?.[slot];
  return he && he.trim() ? he : defaultText(page, slot);
}
