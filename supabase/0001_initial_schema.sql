-- ============================================================
-- Initial schema migration for saurabhsagarji
-- ============================================================
-- Creates the full database schema: 13 tables with RLS policies,
-- full-text search triggers, and shared helper functions.
-- ============================================================


-- ============================================================
-- SETUP: extensions + shared trigger function
-- ============================================================
create extension if not exists "uuid-ossp";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ============================================================
-- ADMIN USERS
-- ============================================================
create table public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role text not null default 'admin' check (role in ('admin', 'editor')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
before update on public.admin_users
for each row execute function public.set_updated_at();

create index admin_users_email_idx on public.admin_users(email);

alter table public.admin_users enable row level security;


-- ============================================================
-- is_admin() helper
-- ============================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admin_users
    where id = auth.uid() and is_active = true
  );
$$;


-- ============================================================
-- POLICIES: admin_users
-- ============================================================
create policy "admins can read admin_users"
on public.admin_users for select
to authenticated
using (public.is_admin());

create policy "admins can update own profile"
on public.admin_users for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());


-- ============================================================
-- SITE CONTENT
-- ============================================================
create table public.site_content (
  key text primary key,
  value_hi text,
  value_en text,
  description text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.admin_users(id)
);

create trigger set_updated_at
before update on public.site_content
for each row execute function public.set_updated_at();

alter table public.site_content enable row level security;

create policy "anyone can read site_content"
on public.site_content for select
to anon, authenticated
using (true);

create policy "admins can insert site_content"
on public.site_content for insert
to authenticated
with check (public.is_admin());

create policy "admins can update site_content"
on public.site_content for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins can delete site_content"
on public.site_content for delete
to authenticated
using (public.is_admin());


-- ============================================================
-- BHAJANS
-- ============================================================
create table public.bhajans (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  title_hi text not null,
  title_en text,
  lyrics_hi text,
  lyrics_en text,
  description_hi text,
  description_en text,
  cover_image_url text,
  youtube_video_id text,
  audio_url text,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.admin_users(id),
  search_vector tsvector
);

create trigger set_updated_at
before update on public.bhajans
for each row execute function public.set_updated_at();

create index bhajans_slug_idx on public.bhajans(slug);
create index bhajans_published_idx on public.bhajans(is_published, published_at desc);
create index bhajans_search_idx on public.bhajans using gin(search_vector);

alter table public.bhajans enable row level security;


-- ============================================================
-- TEACHINGS
-- ============================================================
create table public.teachings (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  title_hi text not null,
  title_en text,
  summary_hi text,
  summary_en text,
  transcript_hi text,
  transcript_en text,
  cover_image_url text,
  youtube_video_id text,
  audio_url text,
  duration_seconds integer,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.admin_users(id),
  search_vector tsvector
);

create trigger set_updated_at
before update on public.teachings
for each row execute function public.set_updated_at();

create index teachings_slug_idx on public.teachings(slug);
create index teachings_published_idx on public.teachings(is_published, published_at desc);
create index teachings_search_idx on public.teachings using gin(search_vector);

alter table public.teachings enable row level security;


-- ============================================================
-- BOOKS
-- ============================================================
create table public.books (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  title_hi text not null,
  title_en text,
  description_hi text,
  description_en text,
  cover_image_url text,
  preview_pdf_url text,
  purchase_url text,
  download_url text,
  publication_year integer,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.admin_users(id),
  search_vector tsvector
);

create trigger set_updated_at
before update on public.books
for each row execute function public.set_updated_at();

create index books_slug_idx on public.books(slug);
create index books_published_idx on public.books(is_published, published_at desc);
create index books_search_idx on public.books using gin(search_vector);

alter table public.books enable row level security;


-- ============================================================
-- EVENTS
-- ============================================================
create table public.events (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  title_hi text not null,
  title_en text,
  description_hi text,
  description_en text,
  cover_image_url text,
  venue_name text,
  venue_address text,
  venue_map_url text,
  start_datetime timestamptz not null,
  end_datetime timestamptz,
  gallery_album_id uuid,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.admin_users(id),
  search_vector tsvector
);

create trigger set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

create index events_slug_idx on public.events(slug);
create index events_start_idx on public.events(start_datetime desc);
create index events_published_idx on public.events(is_published, start_datetime desc);
create index events_search_idx on public.events using gin(search_vector);

alter table public.events enable row level security;


-- ============================================================
-- NEWS POSTS
-- ============================================================
create table public.news_posts (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  title_hi text not null,
  title_en text,
  body_hi text,
  body_en text,
  cover_image_url text,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.admin_users(id),
  search_vector tsvector
);

create trigger set_updated_at
before update on public.news_posts
for each row execute function public.set_updated_at();

create index news_posts_slug_idx on public.news_posts(slug);
create index news_posts_published_idx on public.news_posts(is_published, published_at desc);
create index news_posts_search_idx on public.news_posts using gin(search_vector);

alter table public.news_posts enable row level security;


-- ============================================================
-- GALLERY ALBUMS
-- ============================================================
create table public.gallery_albums (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  title_hi text not null,
  title_en text,
  description_hi text,
  description_en text,
  cover_image_url text,
  album_date date,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.admin_users(id)
);

create trigger set_updated_at
before update on public.gallery_albums
for each row execute function public.set_updated_at();

create index gallery_albums_slug_idx on public.gallery_albums(slug);
create index gallery_albums_published_idx on public.gallery_albums(is_published, album_date desc);

alter table public.gallery_albums enable row level security;


-- ============================================================
-- GALLERY PHOTOS
-- ============================================================
create table public.gallery_photos (
  id uuid primary key default uuid_generate_v4(),
  album_id uuid not null references public.gallery_albums(id) on delete cascade,
  image_url text not null,
  caption_hi text,
  caption_en text,
  alt_text text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  created_by uuid references public.admin_users(id)
);

create index gallery_photos_album_idx on public.gallery_photos(album_id, display_order);

alter table public.gallery_photos enable row level security;


-- Now that gallery_albums exists, add the FK from events.gallery_album_id
alter table public.events
add constraint events_gallery_album_fk
foreign key (gallery_album_id) references public.gallery_albums(id) on delete set null;


-- ============================================================
-- CATEGORIES
-- ============================================================
create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name_hi text not null,
  name_en text,
  description_hi text,
  description_en text,
  applies_to text not null check (applies_to in ('bhajan', 'teaching', 'both')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create index categories_slug_idx on public.categories(slug);
create index categories_applies_to_idx on public.categories(applies_to);

alter table public.categories enable row level security;


-- ============================================================
-- JUNCTION TABLES
-- ============================================================
create table public.bhajan_categories (
  bhajan_id uuid not null references public.bhajans(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (bhajan_id, category_id)
);

create index bhajan_categories_category_idx on public.bhajan_categories(category_id);

alter table public.bhajan_categories enable row level security;


create table public.teaching_categories (
  teaching_id uuid not null references public.teachings(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (teaching_id, category_id)
);

create index teaching_categories_category_idx on public.teaching_categories(category_id);

alter table public.teaching_categories enable row level security;


-- ============================================================
-- CONTACT SUBMISSIONS
-- ============================================================
create table public.contact_submissions (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  is_read boolean not null default false,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index contact_submissions_created_idx on public.contact_submissions(created_at desc);
create index contact_submissions_unread_idx on public.contact_submissions(is_read, created_at desc);

alter table public.contact_submissions enable row level security;


-- ============================================================
-- FULL-TEXT SEARCH TRIGGERS
-- ============================================================
create or replace function public.bhajans_search_vector_update()
returns trigger
language plpgsql
as $$
begin
  new.search_vector :=
    setweight(to_tsvector('simple', coalesce(new.title_hi, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.title_en, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.description_hi, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(new.description_en, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(new.lyrics_hi, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(new.lyrics_en, '')), 'C');
  return new;
end;
$$;

create trigger bhajans_search_vector_trigger
before insert or update on public.bhajans
for each row execute function public.bhajans_search_vector_update();


create or replace function public.teachings_search_vector_update()
returns trigger
language plpgsql
as $$
begin
  new.search_vector :=
    setweight(to_tsvector('simple', coalesce(new.title_hi, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.title_en, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.summary_hi, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(new.summary_en, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(new.transcript_hi, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(new.transcript_en, '')), 'C');
  return new;
end;
$$;

create trigger teachings_search_vector_trigger
before insert or update on public.teachings
for each row execute function public.teachings_search_vector_update();


create or replace function public.books_search_vector_update()
returns trigger
language plpgsql
as $$
begin
  new.search_vector :=
    setweight(to_tsvector('simple', coalesce(new.title_hi, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.title_en, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.description_hi, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(new.description_en, '')), 'B');
  return new;
end;
$$;

create trigger books_search_vector_trigger
before insert or update on public.books
for each row execute function public.books_search_vector_update();


create or replace function public.events_search_vector_update()
returns trigger
language plpgsql
as $$
begin
  new.search_vector :=
    setweight(to_tsvector('simple', coalesce(new.title_hi, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.title_en, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.description_hi, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(new.description_en, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(new.venue_name, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(new.venue_address, '')), 'C');
  return new;
end;
$$;

create trigger events_search_vector_trigger
before insert or update on public.events
for each row execute function public.events_search_vector_update();


create or replace function public.news_posts_search_vector_update()
returns trigger
language plpgsql
as $$
begin
  new.search_vector :=
    setweight(to_tsvector('simple', coalesce(new.title_hi, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.title_en, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.body_hi, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(new.body_en, '')), 'B');
  return new;
end;
$$;

create trigger news_posts_search_vector_trigger
before insert or update on public.news_posts
for each row execute function public.news_posts_search_vector_update();


-- ============================================================
-- RLS POLICIES: content tables
-- ============================================================

-- Bhajans
create policy "public can read published bhajans"
on public.bhajans for select to anon, authenticated
using (is_published = true);

create policy "admins can read all bhajans"
on public.bhajans for select to authenticated
using (public.is_admin());

create policy "admins can insert bhajans"
on public.bhajans for insert to authenticated
with check (public.is_admin());

create policy "admins can update bhajans"
on public.bhajans for update to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "admins can delete bhajans"
on public.bhajans for delete to authenticated
using (public.is_admin());


-- Teachings
create policy "public can read published teachings"
on public.teachings for select to anon, authenticated
using (is_published = true);

create policy "admins can read all teachings"
on public.teachings for select to authenticated
using (public.is_admin());

create policy "admins can insert teachings"
on public.teachings for insert to authenticated
with check (public.is_admin());

create policy "admins can update teachings"
on public.teachings for update to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "admins can delete teachings"
on public.teachings for delete to authenticated
using (public.is_admin());


-- Books
create policy "public can read published books"
on public.books for select to anon, authenticated
using (is_published = true);

create policy "admins can read all books"
on public.books for select to authenticated
using (public.is_admin());

create policy "admins can insert books"
on public.books for insert to authenticated
with check (public.is_admin());

create policy "admins can update books"
on public.books for update to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "admins can delete books"
on public.books for delete to authenticated
using (public.is_admin());


-- Events
create policy "public can read published events"
on public.events for select to anon, authenticated
using (is_published = true);

create policy "admins can read all events"
on public.events for select to authenticated
using (public.is_admin());

create policy "admins can insert events"
on public.events for insert to authenticated
with check (public.is_admin());

create policy "admins can update events"
on public.events for update to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "admins can delete events"
on public.events for delete to authenticated
using (public.is_admin());


-- News posts
create policy "public can read published news_posts"
on public.news_posts for select to anon, authenticated
using (is_published = true);

create policy "admins can read all news_posts"
on public.news_posts for select to authenticated
using (public.is_admin());

create policy "admins can insert news_posts"
on public.news_posts for insert to authenticated
with check (public.is_admin());

create policy "admins can update news_posts"
on public.news_posts for update to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "admins can delete news_posts"
on public.news_posts for delete to authenticated
using (public.is_admin());


-- Gallery albums
create policy "public can read published albums"
on public.gallery_albums for select to anon, authenticated
using (is_published = true);

create policy "admins can read all albums"
on public.gallery_albums for select to authenticated
using (public.is_admin());

create policy "admins can insert albums"
on public.gallery_albums for insert to authenticated
with check (public.is_admin());

create policy "admins can update albums"
on public.gallery_albums for update to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "admins can delete albums"
on public.gallery_albums for delete to authenticated
using (public.is_admin());


-- Gallery photos (visibility inherited from parent album)
create policy "public can read photos in published albums"
on public.gallery_photos for select to anon, authenticated
using (
  exists (
    select 1 from public.gallery_albums
    where gallery_albums.id = gallery_photos.album_id
    and gallery_albums.is_published = true
  )
);

create policy "admins can read all photos"
on public.gallery_photos for select to authenticated
using (public.is_admin());

create policy "admins can insert photos"
on public.gallery_photos for insert to authenticated
with check (public.is_admin());

create policy "admins can update photos"
on public.gallery_photos for update to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "admins can delete photos"
on public.gallery_photos for delete to authenticated
using (public.is_admin());


-- Categories and junction tables
create policy "anyone can read categories"
on public.categories for select to anon, authenticated
using (true);

create policy "admins can insert categories"
on public.categories for insert to authenticated
with check (public.is_admin());

create policy "admins can update categories"
on public.categories for update to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "admins can delete categories"
on public.categories for delete to authenticated
using (public.is_admin());


create policy "anyone can read bhajan_categories"
on public.bhajan_categories for select to anon, authenticated
using (true);

create policy "admins manage bhajan_categories insert"
on public.bhajan_categories for insert to authenticated
with check (public.is_admin());

create policy "admins manage bhajan_categories delete"
on public.bhajan_categories for delete to authenticated
using (public.is_admin());


create policy "anyone can read teaching_categories"
on public.teaching_categories for select to anon, authenticated
using (true);

create policy "admins manage teaching_categories insert"
on public.teaching_categories for insert to authenticated
with check (public.is_admin());

create policy "admins manage teaching_categories delete"
on public.teaching_categories for delete to authenticated
using (public.is_admin());


-- Contact submissions
create policy "anyone can submit contact form"
on public.contact_submissions for insert to anon, authenticated
with check (true);

create policy "admins can read contact submissions"
on public.contact_submissions for select to authenticated
using (public.is_admin());

create policy "admins can update contact submissions"
on public.contact_submissions for update to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "admins can delete contact submissions"
on public.contact_submissions for delete to authenticated
using (public.is_admin());