// Bilingual support: Hebrew (default, RTL, served at root) + Russian (LTR, served under /ru).
// Locale is resolved in middleware and exposed via Astro.locals.lang.

export const LOCALES = ['he', 'ru'] as const;
export type Lang = (typeof LOCALES)[number];
export const DEFAULT_LANG: Lang = 'he';

export function isLang(x: unknown): x is Lang {
  return x === 'he' || x === 'ru';
}
export function dirOf(lang: Lang): 'rtl' | 'ltr' {
  return lang === 'ru' ? 'ltr' : 'rtl';
}
export function htmlLang(lang: Lang): string {
  return lang === 'ru' ? 'ru' : 'he';
}
export function ogLocale(lang: Lang): string {
  return lang === 'ru' ? 'ru_RU' : 'he_IL';
}
export function otherLang(lang: Lang): Lang {
  return lang === 'he' ? 'ru' : 'he';
}

/** Prefix a root-relative path with the locale (he → root, ru → /ru/…). */
export function localizePath(path: string, lang: Lang): string {
  let p = path || '/';
  if (!p.startsWith('/')) p = '/' + p;
  if (lang !== 'ru') return p;
  if (p === '/') return '/ru/';
  return '/ru' + p;
}

/** Split a request path into its locale + the underlying (he) path. */
export function stripLocale(path: string): { lang: Lang; path: string } {
  if (path === '/ru' || path.startsWith('/ru/')) {
    return { lang: 'ru', path: path.replace(/^\/ru(?=\/|$)/, '') || '/' };
  }
  return { lang: 'he', path };
}

/** Pick a value's localized variant: ru uses `<field>_ru`, falling back to Hebrew. */
export function byLang<T extends Record<string, any>>(row: T | null | undefined, field: string, lang: Lang): string {
  if (!row) return '';
  if (lang === 'ru') {
    const ru = row[`${field}_ru`];
    if (ru != null && String(ru).trim() !== '') return ru;
  }
  return row[field] ?? '';
}

type Dict = Record<string, string>;
const STRINGS: Record<Lang, Dict> = {
  he: {
    skip: 'דלג לתוכן',
    nav_home: 'בית',
    nav_investment: 'השקעה',
    nav_process: 'התהליך',
    nav_projects: 'פרויקטים',
    nav_about: 'אודות',
    nav_contact: 'קשר',
    nav_press: 'בתקשורת',
    nav_news: 'חדשות',
    header_cta: 'שיחת ייעוץ',
    consult_primary: 'לשיחת ייעוץ ראשונית',
    cta_call: 'לשיחת אפיון',
    whatsapp: 'וואטסאפ',
    scroll: 'גלול ↓',
    home_stat_eyebrow: 'ההזדמנות',
    home_stat_heading: 'שוק הנדל"ן בדובאי בצמיחה מתמדת',
    mistakes_eyebrow: 'לפני שמשקיעים',
    mistakes_heading: 'שלוש טעויות שעולות למשקיעים ביוקר',
    mistakes_closing: 'הליווי שלנו נועד למנוע בדיוק את אלה.',
    process_eyebrow: 'THE PROCESS',
    process_heading: 'מאפיון ועד ביצוע',
    press_eyebrow: 'בתקשורת',
    press_heading: 'שוק הנדל"ן <span class="neon">בדובאי</span> בכותרות',
    about_eyebrow: 'ABOUT',
    about_name_first: 'גלעד',
    about_name_last: 'הובר',
    about_name: 'גלעד הובר',
    about_bio_1:
      '30 שנות ניסיון בעולם העסקים. לאחר שהעברתי את מרכז חיי לדובאי — ההחלטה הכי טובה שעשיתי — אני מלווה משקיעים ישראלים בגישה שמתחילה ונגמרת באינטרס שלהם.',
    about_bio_2:
      'צוות מקומי בדובאי, גישה לפרויקטים במחיר מתחת לשוק, ותהליך מדויק של בחירה, בדיקה וביצוע.',
    about_link: 'עוד עליי ועל הצוות',
    footer_blurb: 'ליווי משקיעים ישראלים בהשקעות נדל"ן בדובאי — מאפיון ועד ביצוע, בגישה שמתחילה ונגמרת באינטרס שלכם.',
    footer_nav: 'ניווט',
    footer_contact: 'קשר',
    footer_investment: 'השקעה בדובאי',
    privacy: 'פרטיות',
    terms: 'תקנון',
    accessibility: 'נגישות',
    rights: 'כל הזכויות שמורות',
    disclaimer: '* אין באמור משום הבטחת תשואה או ייעוץ השקעות. השקעה בנדל"ן בחו"ל כרוכה בסיכון. הנתונים מובאים לצורכי המחשה בלבד.',
    lang_switch: 'שפה',
    lang_he: 'עברית',
    lang_ru: 'Русский',
  },
  ru: {
    skip: 'Перейти к содержанию',
    nav_home: 'Главная',
    nav_investment: 'Инвестиции',
    nav_process: 'Процесс',
    nav_projects: 'Проекты',
    nav_about: 'О нас',
    nav_contact: 'Контакты',
    nav_press: 'СМИ',
    nav_news: 'Новости',
    header_cta: 'Консультация',
    consult_primary: 'Записаться на консультацию',
    cta_call: 'Консультация',
    whatsapp: 'WhatsApp',
    scroll: 'листайте ↓',
    home_stat_eyebrow: 'Возможность',
    home_stat_heading: 'Рынок недвижимости Дубая стабильно растёт',
    mistakes_eyebrow: 'Прежде чем инвестировать',
    mistakes_heading: 'Три ошибки, которые дорого обходятся инвесторам',
    mistakes_closing: 'Наше сопровождение призвано предотвратить именно их.',
    process_eyebrow: 'THE PROCESS',
    process_heading: 'От анализа до сделки',
    press_eyebrow: 'СМИ',
    press_heading: 'Рынок недвижимости <span class="neon">Дубая</span> в заголовках',
    about_eyebrow: 'ABOUT',
    about_name_first: 'Гилад',
    about_name_last: 'Хубер',
    about_name: 'Гилад Хубер',
    about_bio_1:
      '30 лет опыта в бизнесе. После переезда в Дубай — лучшего решения в моей жизни — я сопровождаю израильских инвесторов с подходом, основанным исключительно на их интересах.',
    about_bio_2:
      'Локальная команда в Дубае, доступ к проектам по цене ниже рынка и выверенный процесс выбора, проверки и реализации.',
    about_link: 'Подробнее обо мне и команде',
    footer_blurb: 'Сопровождение израильских инвесторов в недвижимости Дубая — от анализа потребностей до сделки, с подходом, который всегда на стороне ваших интересов.',
    footer_nav: 'Навигация',
    footer_contact: 'Контакты',
    footer_investment: 'Инвестиции в Дубае',
    privacy: 'Конфиденциальность',
    terms: 'Условия использования',
    accessibility: 'Доступность',
    rights: 'Все права защищены',
    disclaimer: '* Изложенное не является гарантией доходности или инвестиционной рекомендацией. Инвестиции в зарубежную недвижимость сопряжены с риском. Данные приведены в иллюстративных целях.',
    lang_switch: 'Язык',
    lang_he: 'עברית',
    lang_ru: 'Русский',
  },
};

export function t(lang: Lang, key: string): string {
  return STRINGS[lang]?.[key] ?? STRINGS.he[key] ?? key;
}
