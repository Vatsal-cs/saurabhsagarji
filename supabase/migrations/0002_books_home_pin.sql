-- Lets admins pin a curated subset of books to the homepage drag deck,
-- independent of the full /books catalogue.
alter table public.books
  add column if not exists is_home_pinned boolean not null default false;
