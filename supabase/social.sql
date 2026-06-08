-- Social media page URLs for the footer icons. Run ONCE in the Supabase SQL editor.
-- Leave a field empty/NULL to hide that icon on the site. Idempotent (safe to re-run).

alter table site_settings add column if not exists social_facebook  text;
alter table site_settings add column if not exists social_instagram text;
alter table site_settings add column if not exists social_youtube   text;
alter table site_settings add column if not exists social_tiktok    text;
