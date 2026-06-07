-- Bilingual (Russian) content columns. Run ONCE in the Supabase SQL editor.
-- Each Hebrew text field gets a *_ru sibling; empty/NULL Russian falls back to Hebrew
-- on the site. Idempotent (safe to re-run).

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

alter table areas         add column if not exists ru       text; -- Russian area name (sibling of "he")
alter table areas         add column if not exists blurb_ru text;

alter table press         add column if not exists title_ru text;

alter table page_sections add column if not exists value_ru text;

alter table news          add column if not exists title_ru   text;
alter table news          add column if not exists excerpt_ru text;
alter table news          add column if not exists body_ru    text;
