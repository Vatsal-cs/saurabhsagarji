-- Lets each about-section ("jivni") page attach one or more related YouTube
-- videos, shown as hover-to-preview cards at the bottom of the biography.
create table if not exists public.about_section_videos (
  id uuid primary key default uuid_generate_v4(),
  about_section_id uuid not null references public.about_sections(id) on delete cascade,
  youtube_video_id text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  created_by uuid references public.admin_users(id)
);

create index if not exists about_section_videos_section_idx
  on public.about_section_videos(about_section_id, display_order);

alter table public.about_section_videos enable row level security;

create policy "anyone can read videos of published sections"
on public.about_section_videos for select to anon, authenticated
using (
  exists (
    select 1 from public.about_sections
    where about_sections.id = about_section_videos.about_section_id
    and about_sections.is_published = true
  )
);

create policy "admins can read all about section videos"
on public.about_section_videos for select to authenticated
using (public.is_admin());

create policy "admins can insert about section videos"
on public.about_section_videos for insert to authenticated
with check (public.is_admin());

create policy "admins can update about section videos"
on public.about_section_videos for update to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "admins can delete about section videos"
on public.about_section_videos for delete to authenticated
using (public.is_admin());
