import { unstable_cache } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createStaticClient } from '@/lib/supabase/static';
import type { Database } from '@/types/database';

type Section = Database['public']['Tables']['about_sections']['Row'];

export type PublicAboutSection = {
  id: string;
  slug: string;
  title_hi: string;
  title_en: string | null;
  intro_hi: string | null;
  intro_en: string | null;
  body_hi: string | null;
  body_en: string | null;
  photo_1_url: string | null;
  photo_2_url: string | null;
  display_order: number;
};

export type PublicAboutVideo = {
  id: string;
  youtube_video_id: string;
  display_order: number;
};

function toPublic(row: Section): PublicAboutSection {
  return {
    id: row.id,
    slug: row.slug,
    title_hi: row.title_hi,
    title_en: row.title_en,
    intro_hi: row.intro_hi,
    intro_en: row.intro_en,
    body_hi: row.body_hi,
    body_en: row.body_en,
    photo_1_url: row.photo_1_url,
    photo_2_url: row.photo_2_url,
    display_order: row.display_order,
  };
}

/**
 * All published sections, ordered — used for the nav dropdown.
 * Cached and cookie-free (see getPublishedBhajans in bhajans.ts for why).
 */
export const getPublishedAboutSections = unstable_cache(
  async (): Promise<PublicAboutSection[]> => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from('about_sections')
      .select('*')
      .eq('is_published', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[getPublishedAboutSections]', error);
      return [];
    }
    return (data ?? []).map(toPublic);
  },
  ['getPublishedAboutSections'],
  { revalidate: 60 }
);

/** Build-time variant, no cookies — safe in generateStaticParams. */
export async function getPublishedAboutSectionsStatic(): Promise<PublicAboutSection[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from('about_sections')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[getPublishedAboutSectionsStatic]', error);
    return [];
  }
  return (data ?? []).map(toPublic);
}

/**
 * Videos attached to a section, in display order — shown as cards at the
 * bottom of the biography page.
 * Cached and cookie-free (see getPublishedBhajans in bhajans.ts for why).
 */
export const getAboutSectionVideos = unstable_cache(
  async (sectionId: string): Promise<PublicAboutVideo[]> => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from('about_section_videos')
      .select('id, youtube_video_id, display_order')
      .eq('about_section_id', sectionId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[getAboutSectionVideos]', error);
      return [];
    }
    return data ?? [];
  },
  ['getAboutSectionVideos'],
  { revalidate: 60 }
);

export const getPublishedAboutSectionBySlug = unstable_cache(
  async (slug: string): Promise<(PublicAboutSection & { videos: PublicAboutVideo[] }) | null> => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from('about_sections')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle();

    if (error) {
      console.error('[getPublishedAboutSectionBySlug]', error);
      return null;
    }
    if (!data) return null;

    const videos = await getAboutSectionVideos(data.id);
    return { ...toPublic(data), videos };
  },
  ['getPublishedAboutSectionBySlug'],
  { revalidate: 60 }
);

/** Admin: every section regardless of publish state, in display order. */
export async function getAllAboutSectionsForAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('about_sections')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[getAllAboutSectionsForAdmin]', error);
    return [];
  }
  return data ?? [];
}

export async function getAboutSectionForAdmin(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('about_sections')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('[getAboutSectionForAdmin]', error);
    return null;
  }
  if (!data) return null;

  const videos = await getAboutSectionVideos(data.id);
  return { ...data, videos };
}
