-- Small preview copy of each check-in photo, shown in the diary and photo grid so they
-- don't download the full-size photo. Null for photos uploaded before thumbnails existed.
alter table public.checkins add column if not exists thumb_path text;
