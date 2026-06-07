-- Update the process steps ("מאפיון ועד ביצוע") to the 6-step flow.
-- Run ONCE in the Supabase SQL editor. Safe to re-run (idempotent).

-- Ensure the Russian columns exist (in case supabase/i18n.sql wasn't run yet).
alter table process_steps add column if not exists title_ru text;
alter table process_steps add column if not exists text_ru  text;

-- Replace the existing steps with the 6-step flow (Hebrew + Russian).
delete from process_steps;
insert into process_steps (n, title, "text", title_ru, text_ru, sort) values
  ('01', 'שיחת אפיון',          'הבנה מדויקת של התקציב, המטרות ורמת הסיכון',           'Установочная беседа',          'Точное понимание бюджета, целей и уровня риска',                   1),
  ('02', 'אסטרטגיית השקעה',     'התאמה של סוג העסקה למה שמתאים לך',                    'Инвестиционная стратегия',     'Подбор типа сделки под то, что подходит именно вам',               2),
  ('03', 'איתור הנכס',          'גישה להזדמנויות נבחרות, כולל עסקאות מתחת למחיר שוק',   'Поиск объекта',                'Доступ к отобранным возможностям, включая сделки ниже рынка',      3),
  ('04', 'ניתוח כלכלי',         'תמונה מלאה ואמיתית של העסקה',                         'Экономический анализ',         'Полная и достоверная картина сделки',                             4),
  ('05', 'ביצוע וחתימה',        'ליווי מלא עד רישום הנכס',                             'Реализация и подписание',      'Полное сопровождение до регистрации объекта',                     5),
  ('06', 'מעטפת לאחר הרכישה',    'ניהול, השכרה וכל מה שנדרש — במקום אחד',               'Сопровождение после покупки',  'Управление, аренда и всё необходимое — в одном месте',            6);
