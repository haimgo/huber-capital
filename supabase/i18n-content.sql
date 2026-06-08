-- Russian translations for all Supabase-managed content (settings + lists).
-- Run ONCE in the Supabase SQL editor. Idempotent + safe to re-run.
-- (Page headings/prose/CTAs are translated in code; this covers DB content.)

-- 1) Ensure the Russian columns exist (in case supabase/i18n.sql wasn't run yet).
alter table site_settings add column if not exists hero_eyebrow_ru   text;
alter table site_settings add column if not exists hero_title_ru     text;
alter table site_settings add column if not exists hero_sub_ru       text;
alter table site_settings add column if not exists manifesto_main_ru text;
alter table site_settings add column if not exists manifesto_sub_ru  text;
alter table site_settings add column if not exists cta_title_ru      text;
alter table site_settings add column if not exists cta_sub_ru        text;
alter table stats         add column if not exists value_ru text;
alter table stats         add column if not exists label_ru text;
alter table process_steps add column if not exists title_ru text;
alter table process_steps add column if not exists text_ru  text;
alter table mistakes      add column if not exists title_ru text;
alter table mistakes      add column if not exists text_ru  text;
alter table areas         add column if not exists ru       text;
alter table areas         add column if not exists blurb_ru text;
alter table press         add column if not exists title_ru text;

-- 2) Site settings (hero / manifesto / CTA).
update site_settings set
  hero_title_ru     = 'Инвестиции в Дубае',
  hero_sub_ru       = 'От 200 000 ₪ собственного капитала · потенциал роста стоимости ~10% в год · полное сопровождение A–Z',
  manifesto_main_ru = 'Я не продаю недвижимость — я анализирую инвестиции.',
  manifesto_sub_ru  = 'Это не просто сделка. Это путь, цель которого — создать для вас успех.',
  cta_title_ru      = 'Готовы отправиться в путь?',
  cta_sub_ru        = 'Первичная консультация без обязательств — вместе поймём, что подходит именно вам.'
where id = 1;

-- 3) Stats (numbers stay; only the labels are translated).
update stats set label_ru = 'рост цен на квартиры в год' where value = '+17%';
update stats set label_ru = 'цена за м² (в долларах)'    where value = '+122%';
update stats set label_ru = 'лет опыта'                  where value = '30';
update stats set label_ru = 'отобранных проектов'        where value = '26';

-- 4) Process steps.
update process_steps set title_ru = 'Установочная беседа',          text_ru = 'Точное понимание бюджета, целей и уровня риска'              where n = '01';
update process_steps set title_ru = 'Инвестиционная стратегия',     text_ru = 'Подбор типа сделки под то, что подходит именно вам'          where n = '02';
update process_steps set title_ru = 'Поиск объекта',               text_ru = 'Доступ к отобранным возможностям, включая сделки ниже рынка' where n = '03';
update process_steps set title_ru = 'Экономический анализ',         text_ru = 'Полная и достоверная картина сделки'                        where n = '04';
update process_steps set title_ru = 'Реализация и подписание',      text_ru = 'Полное сопровождение до регистрации объекта'                where n = '05';
update process_steps set title_ru = 'Сопровождение после покупки',  text_ru = 'Управление, аренда и всё необходимое — в одном месте'       where n = '06';

-- 5) Common mistakes.
update mistakes set title_ru = 'Ненадёжный застройщик', text_ru = 'Работа с молодым или финансово неустойчивым застройщиком ставит под угрозу всю инвестицию.' where n = '01';
update mistakes set title_ru = 'Неподходящий проект',   text_ru = 'Неточный выбор проекта снижает доходность, ликвидность и горизонт выхода.'                   where n = '02';
update mistakes set title_ru = 'Неточные данные',       text_ru = 'Опора на ошибочные данные ведёт к дорогим и труднопоправимым решениям.'                     where n = '03';

-- 6) Areas (Russian name + blurb; English name stays as the eyebrow).
update areas set ru = 'Палм-Джумейра',           blurb_ru = 'Престижный искусственный остров — виллы и пентхаусы у моря, одни из самых востребованных объектов в мире.' where name = 'Palm Jumeirah';
update areas set ru = 'Даунтаун Дубай',          blurb_ru = 'Сердце города вокруг Бурдж-Халифы — высокий и стабильный спрос на аренду.'                                  where name = 'Downtown Dubai';
update areas set ru = 'Дубай Марина',            blurb_ru = 'Район небоскрёбов у воды, оживлённый образ жизни и сильный спрос на аренду.'                                where name = 'Dubai Marina';
update areas set ru = 'Бизнес-Бэй',              blurb_ru = 'Развивающийся деловой центр у канала — высокий потенциал роста стоимости.'                                 where name = 'Business Bay';
update areas set ru = 'Джумейра Вилладж Серкл',  blurb_ru = 'Растущий семейный район — доступные цены входа и привлекательная арендная доходность.'                     where name = 'JVC';

-- 7) Press.
update press set title_ru = '«Цены на квартиры в Дубае выросли на 17% за год»' where outlet = 'ynet';
update press set title_ru = '«Резкий рост продаж элитного жилья в Дубае»'      where outlet = 'TheMarker';
update press set title_ru = '«Золотая возможность для инвесторов»'             where outlet = 'Mako';
